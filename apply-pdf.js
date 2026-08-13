/**
 * Fills the official "Standard Application for Employment" PDF from the
 * values typed into the web form, so the employer receives the real document
 * rather than a list of form fields.
 *
 * The blank PDF is a fillable AcroForm; every value is written into its named
 * field and then flattened. The two items the paper form has no field for
 * (the felony explanation and the signature) are drawn onto the page at the
 * coordinates measured from the original document.
 */
(function () {
  'use strict';

  var BLANK_PDF_URL = 'forms/employment-application.pdf';

  // Measured from the original PDF (points, origin at bottom-left).
  var EXPLAIN = { page: 0, y: 430, indentX: 95, x: 28.7, right: 588, lineHeight: 9.5, size: 8 };
  var SIGNATURE = { page: 1, x: 30, y: 48, maxWidth: 250, maxHeight: 22 };

  var blankPdf = null;

  function loadBlank() {
    if (!blankPdf) {
      blankPdf = fetch(BLANK_PDF_URL).then(function (res) {
        if (!res.ok) throw new Error('Could not load the application template (HTTP ' + res.status + ')');
        return res.arrayBuffer();
      });
    }
    return blankPdf;
  }

  // The PDF's standard fonts are Latin-1 only, so fold typographic characters
  // down to their ASCII equivalents and drop anything still unencodable.
  function clean(value) {
    return String(value == null ? '' : value)
      .replace(/[‘’‚′]/g, "'")
      .replace(/[“”„″]/g, '"')
      .replace(/[–—−]/g, '-')
      .replace(/…/g, '...')
      .replace(/[   ]/g, ' ')
      .replace(/[^\t\n\r\x20-\xFF]/g, '')
      .trim();
  }

  function usDate(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso || '').trim());
    return m ? m[2] + '/' + m[3] + '/' + m[1] : clean(iso);
  }

  function reader(formEl) {
    var fd = new FormData(formEl);
    return {
      get: function (name) {
        var v = fd.get(name);
        return typeof v === 'string' ? clean(v) : '';
      },
      list: function (name) {
        return fd.getAll(name).filter(function (v) { return typeof v === 'string'; }).map(clean);
      }
    };
  }

  // Every setter swallows its own errors: one unmappable field must never cost
  // the applicant their submission.
  function setText(form, name, value, opts) {
    if (!value) return;
    opts = opts || {};
    try {
      var field = form.getTextField(name);
      if (opts.multiline) field.enableMultiline();
      field.setText(value);
      field.setFontSize(opts.size || 9);
    } catch (e) { /* field missing or unwritable — skip it */ }
  }

  function mark(form, name, on) {
    if (on) setText(form, name, 'X', { size: 6 });
  }

  function check(form, name, on) {
    if (!on) return;
    try { form.getCheckBox(name).check(); } catch (e) {}
  }

  function pick(form, name, option) {
    if (!option) return;
    try { form.getRadioGroup(name).select(option); } catch (e) {}
  }

  function wrapText(text, font, size, maxWidth) {
    var words = String(text).split(/\s+/).filter(Boolean);
    var lines = [];
    var line = '';
    words.forEach(function (word) {
      var candidate = line ? line + ' ' + word : word;
      if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
        line = candidate;
      } else {
        if (line) lines.push(line);
        line = word;
      }
    });
    if (line) lines.push(line);
    return lines;
  }

  function build(formEl, signature) {
    var PDFLib = window.PDFLib;
    if (!PDFLib) return Promise.reject(new Error('PDF library unavailable'));

    var r = reader(formEl);

    return loadBlank()
      .then(function (bytes) { return PDFLib.PDFDocument.load(bytes); })
      .then(function (doc) {
        var form = doc.getForm();

        // ---- Header ----------------------------------------------------
        var location = r.get('Location Applying To');
        setText(form, 'Employer', 'MG Appliance' + (location ? ' - ' + location : ''));
        setText(form, 'Position applying for', r.get('Position Applying For'));

        // ---- Personal data ---------------------------------------------
        var last = r.get('Last Name');
        var first = r.get('First Name');
        var middle = r.get('Middle Name');
        var fullName = last + (first ? ', ' + first : '') + (middle ? ' ' + middle : '');
        setText(form, 'Name last first middle', fullName);
        setText(form, 'Street Address andor Mailing Address', r.get('Street Address'));
        setText(form, 'City', r.get('City'));
        setText(form, 'State', r.get('State'));
        setText(form, 'Zip', r.get('Zip'));
        setText(form, 'Home Telephone Number', r.get('Home Phone'));
        setText(form, 'Business Telephone Number', r.get('Business Phone'));
        setText(form, 'Cellular Telephone Number', r.get('Cell Phone'));
        setText(form, 'Date you can start work', usDate(r.get('Date Available To Start')));
        setText(form, 'Salary Desired', r.get('Salary Desired'));
        pick(form, 'Do you have a High School Diploma or GED', r.get('High School Diploma or GED'));

        // ---- Position information --------------------------------------
        var hours = r.get('Hours');
        mark(form, 'undefined', hours === 'Full Time' || hours === 'Either');    // Full Time
        mark(form, 'undefined_2', hours === 'Part Time' || hours === 'Either');  // Part Time

        var status = r.get('Status');
        mark(form, 'Regular', status === 'Regular' || status === 'Either');
        check(form, 'Temporary', status === 'Temporary' || status === 'Either');

        var shifts = r.list('Shifts Willing To Work');
        function willing(name) { return shifts.indexOf(name) !== -1; }
        mark(form, 'Days', willing('Days'));
        mark(form, 'Swing', willing('Swing'));
        check(form, 'Evenings', willing('Evenings'));
        check(form, 'Graveyard', willing('Graveyard'));
        check(form, 'Weekends', willing('Weekends'));

        // Yes/No pairs are plain text boxes on this form, so they get an X.
        function yesNo(answer, yesField, noField) {
          mark(form, yesField, answer === 'Yes');
          mark(form, noField, answer === 'No');
        }
        yesNo(r.get('Authorized To Work In US'), 'Yes_2', 'No_2');
        yesNo(r.get('Convicted Of A Felony'), 'Yes_3', 'No_3');
        yesNo(r.get('Told Essential Functions'), 'Yes_4', 'No_4');
        yesNo(r.get('Can Perform Essential Functions'), 'Yes_5', 'No_5');

        // ---- Qualifications ---------------------------------------------
        setText(form, 'School NameSchool', r.get('School 1 Name'), { size: 8 });
        setText(form, 'DegreeSchool', r.get('School 1 Degree'), { size: 8 });
        setText(form, 'AddressCityStateSchool', r.get('School 1 Address'), { size: 8 });
        setText(form, 'School NameSchool_2', r.get('School 2 Name'), { size: 8 });
        setText(form, 'DegreeSchool_2', r.get('School 2 Degree'), { size: 8 });
        setText(form, 'AddressCityStateSchool_2', r.get('School 2 Address'), { size: 8 });
        setText(form, 'School NameOther', r.get('Other Training Name'), { size: 8 });
        setText(form, 'DegreeOther', r.get('Other Training Degree'), { size: 8 });
        setText(form, 'AddressCityStateOther', r.get('Other Training Address'), { size: 8 });

        // The large box above the references table is the Special Skills area
        // (the original form names the field "REFERENCES").
        setText(form, 'REFERENCES', r.get('Special Skills'), { multiline: true, size: 8 });

        // ---- References --------------------------------------------------
        [1, 2, 3].forEach(function (n) {
          setText(form, 'NameRow' + n, r.get('Reference ' + n + ' Name'), { size: 8 });
          setText(form, 'AddressCityStateRow' + n, r.get('Reference ' + n + ' Address'), { size: 8 });
          setText(form, 'PhoneRow' + n, r.get('Reference ' + n + ' Phone'), { size: 8 });
          setText(form, 'RelationshipRow' + n, r.get('Reference ' + n + ' Relationship'), { size: 8 });
        });

        // ---- Work history -------------------------------------------------
        // Job 1 uses the unsuffixed field names; City/State/Zip run one ahead
        // because the applicant's own City/State/Zip take the first slot.
        var jobSuffix = ['', '_2', '_3', '_4'];
        var addrSuffix = ['_2', '_3', '_4', '_5'];
        [1, 2, 3, 4].forEach(function (n) {
          var s = jobSuffix[n - 1];
          var a = addrSuffix[n - 1];
          var p = 'Job ' + n + ' ';
          setText(form, 'Job Title ' + n, r.get(p + 'Title'), { size: 8 });
          setText(form, 'Start Date modayyr' + s, usDate(r.get(p + 'Start Date')), { size: 8 });
          setText(form, 'End Date modayyr' + s, usDate(r.get(p + 'End Date')), { size: 8 });
          setText(form, 'Company Name' + s, r.get(p + 'Company'), { size: 8 });
          setText(form, 'Supervisors Name' + s, r.get(p + 'Supervisor'), { size: 8 });
          setText(form, 'Phone Number' + s, r.get(p + 'Phone'), { size: 8 });
          setText(form, 'City' + a, r.get(p + 'City'), { size: 8 });
          setText(form, 'State' + a, r.get(p + 'State'), { size: 8 });
          setText(form, 'Zip' + a, r.get(p + 'Zip'), { size: 8 });
          setText(form, 'Duties' + s, r.get(p + 'Duties'), { multiline: true, size: 7.5 });
          setText(form, 'Reason for Leaving' + s, r.get(p + 'Reason For Leaving'), { size: 8 });
          setText(form, 'Starting Salary' + s, r.get(p + 'Starting Salary'), { size: 8 });
          setText(form, 'Ending Salary' + s, r.get(p + 'Ending Salary'), { size: 8 });
        });

        var contact = r.get('May We Contact Present Employer');
        pick(form, 'undefined_3',
          contact === 'Yes' ? 'Yes_6' : contact === 'No' ? 'No_6' : contact === 'N/A' ? 'NA' : '');

        setText(form, 'Date', usDate(r.get('Signature Date')));

        try { form.flatten(); } catch (e) { /* leave fields live rather than fail */ }

        return doc;
      })
      .then(function (doc) {
        var PDFLibRef = window.PDFLib;
        return doc.embedFont(PDFLibRef.StandardFonts.Helvetica).then(function (helv) {
          return doc.embedFont(PDFLibRef.StandardFonts.HelveticaBold).then(function (bold) {
            return { doc: doc, helv: helv, bold: bold };
          });
        });
      })
      .then(function (ctx) {
        var doc = ctx.doc;
        var helv = ctx.helv;
        var pages = doc.getPages();
        var rgb = window.PDFLib.rgb;
        var overflow = '';

        // ---- Felony explanation (no field exists for it) ------------------
        var explanation = r.get('Felony Explanation');
        // Only one line fits before the next rule on the form, so anything
        // longer is marked here and reproduced in full on the supplement page.
        if (explanation) {
          var size = EXPLAIN.size;
          var maxWidth = EXPLAIN.right - EXPLAIN.indentX;
          var inline = wrapText(explanation, helv, size, maxWidth);
          var text;
          if (inline.length <= 1) {
            text = inline[0] || '';
          } else {
            var suffix = ' (full text on attached page)';
            var room = maxWidth - helv.widthOfTextAtSize(suffix, size);
            text = (wrapText(explanation, helv, size, room)[0] || '') + suffix;
            overflow = explanation;
          }
          pages[EXPLAIN.page].drawText(text, {
            x: EXPLAIN.indentX, y: EXPLAIN.y, size: size, font: helv, color: rgb(0, 0, 0)
          });
        }

        // ---- Signature ------------------------------------------------------
        var stamp = signature && signature.pngBytes
          ? doc.embedPng(signature.pngBytes)
          : Promise.resolve(null);

        return stamp.then(function (img) {
          if (img) {
            var scale = Math.min(SIGNATURE.maxWidth / img.width, SIGNATURE.maxHeight / img.height);
            pages[SIGNATURE.page].drawImage(img, {
              x: SIGNATURE.x,
              y: SIGNATURE.y,
              width: img.width * scale,
              height: img.height * scale
            });
          }
          return { doc: doc, helv: helv, bold: ctx.bold, overflow: overflow };
        });
      })
      .then(function (ctx) {
        // ---- Supplement page for answers the paper form has no field for ----
        var doc = ctx.doc;
        var rgb = window.PDFLib.rgb;
        var page = doc.addPage([612, 792]);
        var y = 730;

        page.drawText('MG APPLIANCE - ONLINE APPLICATION SUPPLEMENT', {
          x: 54, y: y, size: 13, font: ctx.bold, color: rgb(0.1, 0.31, 0.59)
        });
        y -= 16;
        page.drawText('Information collected by the online application that the printed form has no field for.', {
          x: 54, y: y, size: 8.5, font: ctx.helv, color: rgb(0.4, 0.4, 0.4)
        });
        y -= 28;

        var resumeInput = document.getElementById('resume');
        var resumeName = resumeInput && resumeInput.files && resumeInput.files.length
          ? resumeInput.files[0].name
          : 'None attached';

        var rows = [
          ['Location applied to', r.get('Location Applying To')],
          ['Position applied for', r.get('Position Applying For')],
          ['Email address', r.get('Email')],
          ['How they heard about us', r.get('How Did You Hear About Us')],
          ['Resume', resumeName],
          ['Signature', (signature && signature.method === 'Typed')
            ? 'Typed as "' + clean(signature.typedName) + '"'
            : 'Drawn by hand'],
          ['Submitted', new Date().toLocaleString('en-US')]
        ];

        rows.forEach(function (row) {
          if (!row[1]) return;
          page.drawText(row[0] + ':', { x: 54, y: y, size: 10, font: ctx.bold, color: rgb(0, 0, 0) });
          wrapText(row[1], ctx.helv, 10, 558 - 210).forEach(function (line, i) {
            page.drawText(line, { x: 210, y: y - i * 13, size: 10, font: ctx.helv, color: rgb(0, 0, 0) });
          });
          y -= 13 * Math.max(1, wrapText(row[1], ctx.helv, 10, 558 - 210).length) + 8;
        });

        if (ctx.overflow) {
          y -= 12;
          page.drawText('Felony explanation (full text):', {
            x: 54, y: y, size: 10, font: ctx.bold, color: rgb(0, 0, 0)
          });
          y -= 15;
          wrapText(ctx.overflow, ctx.helv, 10, 504).forEach(function (line) {
            page.drawText(line, { x: 54, y: y, size: 10, font: ctx.helv, color: rgb(0, 0, 0) });
            y -= 13;
          });
        }

        return doc.save();
      });
  }

  window.MGApplicationPDF = { build: build, preload: loadBlank };
})();
