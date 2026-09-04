/* er-live.js - the matcher bench and the string-metric lab, for
   learn-entity-resolution-with-phoebe.

   Honesty rail, printed on both widgets: the string metrics and the
   Fellegi-Sunter weights below are REAL implementations running over a labelled
   set of 63 records covering 32 true entities and 35 true pairs. Precision,
   recall, F1, pair completeness, reduction ratio and the cluster count are all
   computed from those labels at the moment you move a control. Nothing is
   scripted and no number is looked up.

   The one thing that is a judgement rather than a measurement is the m and u
   probability table, which stands in for what Splink would estimate with EM on
   a real corpus. It is labelled as such on the page.

   Offline, deterministic, no dependencies. */
(function () {
  "use strict";

  /* ------------------------------------------------------------------ *
   * 1. Meridian - two CRMs and a support system, merged
   * ------------------------------------------------------------------ */

  /* eid is the ground truth: records sharing an eid are the same human.
     32 entities, 63 records, 35 true pairs. The counts are computed from these
     labels at load, never hardcoded downstream. Two records sit deliberately in
     the ambiguous middle: one true pair and one false pair at almost the same
     match weight, which no single threshold can separate. The dirt is the realistic kind:
     nicknames, married names, transliteration, transposed digits, abbreviated
     streets, and the same person with a work and a personal address. */
  var RECORDS = [
    { id: "r01", eid: 1, name: "Robert Chen", email: "r.chen@northwind.example", phone: "0412 336 908", addr: "14 Alder Street", zip: "2010", co: "Northwind Ltd" },
    { id: "r02", eid: 1, name: "Bob Chen", email: "r.chen@northwind.example", phone: "+61 412 336 908", addr: "14 Alder St", zip: "2010", co: "Northwind Limited" },

    { id: "r03", eid: 2, name: "Katherine Doyle", email: "k.doyle@harbourline.example", phone: "0433 771 204", addr: "8 Bellweather Road", zip: "3121", co: "Harbourline" },
    { id: "r04", eid: 2, name: "Catherine Doyle", email: "kate.doyle@gmail.example", phone: "0433 771 204", addr: "8 Bellweather Rd", zip: "3121", co: "Harbourline" },

    { id: "r05", eid: 3, name: "Maria Gonzalez", email: "m.gonzalez@vespera.example", phone: "0455 210 774", addr: "3/91 Quarry Lane", zip: "4000", co: "Vespera" },
    { id: "r06", eid: 3, name: "Maria Gonzales", email: "m.gonzalez@vespera.example", phone: "0455 210 774", addr: "Apt 3 91 Quarry Ln", zip: "4000", co: "Vespera Pty" },

    { id: "r07", eid: 4, name: "Wei Zhang", email: "wei.zhang@lumenpath.example", phone: "0466 003 512", addr: "22 Ferndale Avenue", zip: "6000", co: "Lumenpath" },
    { id: "r08", eid: 4, name: "Zhang Wei", email: "wei.zhang@lumenpath.example", phone: "0466 003 512", addr: "22 Ferndale Ave", zip: "6000", co: "Lumenpath" },

    { id: "r09", eid: 5, name: "Anushka Rao", email: "a.rao@calderstone.example", phone: "0477 884 130", addr: "6 Pellinore Court", zip: "5000", co: "Calderstone" },
    { id: "r10", eid: 5, name: "Anushka Rao", email: "a.rao@calderstone.example", phone: "0477 884 130", addr: "6 Pellinore Ct", zip: "5001", co: "Calderstone" },

    { id: "r11", eid: 6, name: "James O'Neill", email: "j.oneill@brightmoor.example", phone: "0401 552 663", addr: "40 Kestrel Way", zip: "2600", co: "Brightmoor" },
    { id: "r12", eid: 6, name: "James ONeill", email: "j.oneill@brightmoor.example", phone: "0401552663", addr: "40 Kestrel Way", zip: "2600", co: "Brightmoor" },

    { id: "r13", eid: 7, name: "Sarah Whitfield", email: "s.whitfield@tessellate.example", phone: "0422 909 118", addr: "77 Marlowe Street", zip: "7000", co: "Tessellate" },
    { id: "r14", eid: 7, name: "Sarah Whitfield-Barnes", email: "s.barnes@tessellate.example", phone: "0422 909 118", addr: "77 Marlowe St", zip: "7000", co: "Tessellate" },

    { id: "r15", eid: 8, name: "Michael Okonkwo", email: "m.okonkwo@arbourgate.example", phone: "0488 117 245", addr: "12 Sable Grove", zip: "2065", co: "Arbourgate" },
    { id: "r16", eid: 8, name: "Mike Okonkwo", email: "m.okonkwo@arbourgate.example", phone: "0488 117 245", addr: "12 Sable Gr", zip: "2065", co: "Arbourgate" },

    { id: "r17", eid: 9, name: "Priya Nair", email: "p.nair@stillwater.example", phone: "0499 620 351", addr: "5 Wrenfield Place", zip: "3000", co: "Stillwater" },
    { id: "r18", eid: 9, name: "Priya Nayar", email: "priya.n@stillwater.example", phone: "0499 620 351", addr: "5 Wrenfield Pl", zip: "3000", co: "Stillwater" },

    { id: "r19", eid: 10, name: "Thomas Muller", email: "t.muller@heliograph.example", phone: "0410 447 882", addr: "18 Coppice Road", zip: "4051", co: "Heliograph" },
    { id: "r20", eid: 10, name: "Thomas Mueller", email: "t.muller@heliograph.example", phone: "0410 447 882", addr: "18 Coppice Rd", zip: "4051", co: "Heliograph" },

    { id: "r21", eid: 11, name: "Elena Petrova", email: "e.petrova@nordvale.example", phone: "0444 118 906", addr: "31 Larkspur Street", zip: "2000", co: "Nordvale" },
    { id: "r22", eid: 11, name: "Elena Petrov", email: "elena.p@outlook.example", phone: "0444 118 906", addr: "31 Larkspur St", zip: "2000", co: "Nordvale" },

    { id: "r23", eid: 12, name: "David Kim", email: "d.kim@quillon.example", phone: "0431 776 542", addr: "9 Thistledown Drive", zip: "3141", co: "Quillon" },
    { id: "r24", eid: 12, name: "Dave Kim", email: "d.kim@quillon.example", phone: "0431 776 542", addr: "9 Thistledown Dr", zip: "3141", co: "Quillon" },

    { id: "r25", eid: 13, name: "Fatima Al-Hassan", email: "f.alhassan@meridianco.example", phone: "0402 665 331", addr: "24 Ashgrove Terrace", zip: "6009", co: "Meridian" },
    { id: "r26", eid: 13, name: "Fatima Alhassan", email: "f.alhassan@meridianco.example", phone: "0402 665 331", addr: "24 Ashgrove Tce", zip: "6009", co: "Meridian" },

    { id: "r27", eid: 14, name: "Jonathan Reyes", email: "j.reyes@pinehollow.example", phone: "0419 002 774", addr: "63 Selby Street", zip: "5006", co: "Pinehollow" },
    { id: "r28", eid: 14, name: "Jon Reyes", email: "j.reyes@pinehollow.example", phone: "0419 002 774", addr: "63 Selby St", zip: "5006", co: "Pinehollow" },

    { id: "r29", eid: 15, name: "Ingrid Larsson", email: "i.larsson@fjordline.example", phone: "0447 883 209", addr: "2 Havelock Road", zip: "2088", co: "Fjordline" },
    { id: "r30", eid: 15, name: "Ingrid Larsen", email: "ingrid.l@fjordline.example", phone: "0447 883 209", addr: "2 Havelock Rd", zip: "2088", co: "Fjordline" },

    { id: "r31", eid: 16, name: "Chidi Nwosu", email: "c.nwosu@greyfern.example", phone: "0466 512 780", addr: "48 Rushcutter Lane", zip: "2011", co: "Greyfern" },
    { id: "r32", eid: 16, name: "Chidi Nwosu", email: "c.nwosu@greyfern.example", phone: "0466 512 708", addr: "48 Rushcutter Ln", zip: "2011", co: "Greyfern" },

    { id: "r33", eid: 17, name: "Yuki Tanaka", email: "y.tanaka@aeriform.example", phone: "0455 990 217", addr: "15 Beaumont Avenue", zip: "3053", co: "Aeriform" },
    { id: "r34", eid: 17, name: "Yuki Tanaka", email: "y.tanaka@aeriform.example", phone: "0455 990 217", addr: "15 Beaumont Av", zip: "3053", co: "Aeriform" },

    { id: "r35", eid: 18, name: "Grace Mbeki", email: "g.mbeki@rosewick.example", phone: "0433 226 118", addr: "7 Halloran Street", zip: "4006", co: "Rosewick" },
    { id: "r36", eid: 18, name: "Gracie Mbeki", email: "gracie@rosewick.example", phone: "0433 226 118", addr: "7 Halloran St", zip: "4006", co: "Rosewick" },

    { id: "r37", eid: 19, name: "Omar Haddad", email: "o.haddad@silvercrest.example", phone: "0411 774 903", addr: "36 Peverel Road", zip: "2145", co: "Silvercrest" },
    { id: "r38", eid: 19, name: "Omar Hadad", email: "o.haddad@silvercrest.example", phone: "0411 774 903", addr: "36 Peverel Rd", zip: "2145", co: "Silvercrest" },

    { id: "r39", eid: 20, name: "Lucia Rossi", email: "l.rossi@verdantia.example", phone: "0499 118 662", addr: "11 Cassia Court", zip: "3168", co: "Verdantia" },
    { id: "r40", eid: 20, name: "Lucia Rossi", email: "lucia.r@verdantia.example", phone: "0499 118 662", addr: "11 Cassia Ct", zip: "3168", co: "Verdantia" },

    { id: "r41", eid: 21, name: "Nathan Brooks", email: "n.brooks@oakhaven.example", phone: "0422 331 887", addr: "29 Wyndham Street", zip: "2170", co: "Oakhaven" },
    { id: "r42", eid: 21, name: "Nate Brooks", email: "n.brooks@oakhaven.example", phone: "0422 331 887", addr: "29 Wyndham St", zip: "2170", co: "Oakhaven" },

    { id: "r43", eid: 22, name: "Aisha Bello", email: "a.bello@lanternhill.example", phone: "0477 209 553", addr: "4 Kingsmere Road", zip: "6100", co: "Lanternhill" },
    { id: "r44", eid: 22, name: "Aisha Bello", email: "", phone: "0477 209 553", addr: "4 Kingsmere Rd", zip: "6100", co: "Lanternhill" },

    { id: "r45", eid: 23, name: "Peter Novak", email: "p.novak@stonebridge.example", phone: "0404 887 220", addr: "52 Ardmore Street", zip: "3011", co: "Stonebridge" },
    { id: "r46", eid: 23, name: "Petr Novak", email: "petr.novak@stonebridge.example", phone: "0404 887 220", addr: "52 Ardmore St", zip: "3011", co: "Stonebridge" },

    { id: "r47", eid: 24, name: "Hannah Weiss", email: "h.weiss@brackenfield.example", phone: "0466 771 338", addr: "17 Copperfield Way", zip: "2113", co: "Brackenfield" },
    { id: "r48", eid: 24, name: "Hanna Weiss", email: "hanna.weiss@brackenfield.example", phone: "0466 771 338", addr: "17 Copperfield Way", zip: "2113", co: "Brackenfield" },

    /* three records each - where transitive closure starts to matter */
    { id: "r49", eid: 25, name: "Samuel Adeyemi", email: "s.adeyemi@wintergreen.example", phone: "0433 990 116", addr: "60 Tarleton Road", zip: "4102", co: "Wintergreen" },
    { id: "r50", eid: 25, name: "Sam Adeyemi", email: "s.adeyemi@wintergreen.example", phone: "0433 990 116", addr: "60 Tarleton Rd", zip: "4102", co: "Wintergreen" },
    { id: "r51", eid: 25, name: "Samuel Adeyemi", email: "s.adeyemi@wintergreen.example", phone: "0433990116", addr: "60 Tarleton Road", zip: "4102", co: "Wintergreen Ltd" },

    { id: "r52", eid: 26, name: "Leila Nasser", email: "l.nasser@duskwood.example", phone: "0411 226 774", addr: "23 Fennimore Street", zip: "3204", co: "Duskwood" },
    { id: "r53", eid: 26, name: "Leila Nasser", email: "l.nasser@duskwood.example", phone: "0411 226 774", addr: "23 Fennimore St", zip: "3204", co: "Duskwood" },
    { id: "r54", eid: 26, name: "Layla Nasser", email: "layla.n@duskwood.example", phone: "0411 226 774", addr: "23 Fennimore Street", zip: "3204", co: "Duskwood" },

    { id: "r55", eid: 27, name: "Andrei Popescu", email: "a.popescu@holloway.example", phone: "0455 118 902", addr: "88 Ravenswood Drive", zip: "2077", co: "Holloway" },
    { id: "r56", eid: 27, name: "Andrew Popescu", email: "andrei.p@holloway.example", phone: "0455 118 902", addr: "88 Ravenswood Dr", zip: "2077", co: "Holloway" },
    { id: "r57", eid: 27, name: "Andrei Popesku", email: "apopescu@gmail.example", phone: "0455 118 920", addr: "88 Ravenswood Drive", zip: "2077", co: "Holloway" },

    /* singletons - they must NOT be merged into anything */
    { id: "r58", eid: 28, name: "Robert Chan", email: "r.chan@northwind.example", phone: "0412 336 809", addr: "14 Alderley Street", zip: "2010", co: "Northwind Ltd" },
    { id: "r59", eid: 29, name: "Maria Gonzalez", email: "maria.gonzalez@vesperagroup.example", phone: "0455 210 447", addr: "3 Quarry Road", zip: "4000", co: "Vespera Group" },
    { id: "r60", eid: 30, name: "Sam Adeyemo", email: "s.adeyemo@wintergreen.example", phone: "0433 990 611", addr: "60 Tarleton Close", zip: "4102", co: "Wintergreen" },

    /* Sarah changed jobs and moved. Only her mobile stayed the same, so this
       record agrees with her old one on name and phone and disagrees on email,
       address and company. It scores into the SAME band as the father and son
       below - one a true pair, one a false pair, at the same weight. No single
       threshold can separate them, which is the argument for the band. */
    { id: "r63", eid: 7, name: "Sarah Whitfield", email: "sarah.w.barnes@fastmail.example", phone: "0422 909 118", addr: "5 Ledbury Crescent", zip: "7004", co: "Kestrelbank" },

    /* The pair no configuration can get right, because the DATA cannot separate
       them: a father and son with the same name, sharing a household landline,
       who work at different companies and no longer live together. They score
       into the middle band, which is the entire reason Fellegi and Sunter put a
       band there instead of a single cut. */
    { id: "r61", eid: 31, name: "James Whitmore", email: "j.whitmore@caldera.example", phone: "0408 776 512", addr: "9 Ellesmere Road", zip: "3103", co: "Caldera" },
    { id: "r62", eid: 32, name: "James Whitmore", email: "james.whitmore@brightmoor.example", phone: "0408 776 512", addr: "41 Draycott Street", zip: "3121", co: "Brightmoor" }
  ];

  var N = RECORDS.length;
  var ALL_PAIRS = N * (N - 1) / 2;

  function trueEntities() {
    var s = {};
    RECORDS.forEach(function (r) { s[r.eid] = 1; });
    return Object.keys(s).length;
  }
  var TRUE_ENTITIES = trueEntities();

  function truePairCount() {
    var n = 0;
    for (var i = 0; i < N; i++) {
      for (var j = i + 1; j < N; j++) {
        if (RECORDS[i].eid === RECORDS[j].eid) n++;
      }
    }
    return n;
  }
  var TRUE_PAIRS = truePairCount();

  /* ------------------------------------------------------------------ *
   * 2. Normalisation
   * ------------------------------------------------------------------ */

  var NICK = {
    bob: "robert", rob: "robert", bobby: "robert",
    mike: "michael", mick: "michael",
    dave: "david", jon: "jonathan", johnny: "jonathan",
    nate: "nathan", sam: "samuel", gracie: "grace",
    kate: "katherine", katie: "katherine", cathy: "katherine",
    andrew: "andrei", tom: "thomas", tommy: "thomas",
    liz: "elizabeth", beth: "elizabeth"
  };
  var STREET = {
    st: "street", rd: "road", ave: "avenue", av: "avenue", ln: "lane",
    ct: "court", dr: "drive", pl: "place", tce: "terrace", gr: "grove",
    apt: "", unit: "", cl: "close", wy: "way"
  };
  var CO_SUFFIX = /\b(ltd|limited|pty|plc|inc|incorporated|llc|group|co)\b/g;

  function stripAccents(s) {
    return s.replace(/ue/g, "u").replace(/oe/g, "o").replace(/ae/g, "a");
  }
  function baseClean(s) {
    return (s || "").toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
  }
  function normName(s, on) {
    var t = baseClean(s);
    if (!on) return t;
    t = stripAccents(t);
    var parts = t.split(" ").map(function (w) { return NICK[w] || w; });
    parts.sort();                     /* token order should not matter for a name */
    return parts.join(" ");
  }
  function normEmail(s, on) {
    var t = (s || "").toLowerCase().trim();
    if (!on) return t;
    return t.replace(/\+[^@]*@/, "@").replace(/\.(?=[^@]*@)/g, "");
  }
  function normPhone(s, on) {
    var d = (s || "").replace(/\D/g, "");
    if (!on) return (s || "").trim();
    if (d.slice(0, 2) === "61") d = "0" + d.slice(2);
    return d;
  }
  function normAddr(s, on) {
    var t = baseClean(s);
    if (!on) return t;
    return t.split(" ").map(function (w) {
      return Object.prototype.hasOwnProperty.call(STREET, w) ? STREET[w] : w;
    }).filter(Boolean).join(" ");
  }
  function normCo(s, on) {
    var t = baseClean(s);
    if (!on) return t;
    return t.replace(CO_SUFFIX, "").replace(/\s+/g, " ").trim();
  }

  /* ------------------------------------------------------------------ *
   * 3. String similarity - real implementations
   * ------------------------------------------------------------------ */

  function levenshtein(a, b) {
    if (a === b) return 0;
    if (!a.length) return b.length;
    if (!b.length) return a.length;
    var prev = [], cur = [], i, j;
    for (j = 0; j <= b.length; j++) prev[j] = j;
    for (i = 1; i <= a.length; i++) {
      cur[0] = i;
      for (j = 1; j <= b.length; j++) {
        cur[j] = Math.min(
          prev[j] + 1,
          cur[j - 1] + 1,
          prev[j - 1] + (a.charAt(i - 1) === b.charAt(j - 1) ? 0 : 1)
        );
      }
      prev = cur.slice();
    }
    return prev[b.length];
  }
  function levSim(a, b) {
    var m = Math.max(a.length, b.length);
    return m === 0 ? 1 : 1 - levenshtein(a, b) / m;
  }

  /* Damerau-Levenshtein: adds transposition as a single-cost operation, which is
     the difference that matters on typed names. */
  function damerau(a, b) {
    var d = [], i, j;
    for (i = 0; i <= a.length; i++) { d[i] = []; d[i][0] = i; }
    for (j = 0; j <= b.length; j++) d[0][j] = j;
    for (i = 1; i <= a.length; i++) {
      for (j = 1; j <= b.length; j++) {
        var cost = a.charAt(i - 1) === b.charAt(j - 1) ? 0 : 1;
        d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
        if (i > 1 && j > 1 && a.charAt(i - 1) === b.charAt(j - 2) && a.charAt(i - 2) === b.charAt(j - 1)) {
          d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
        }
      }
    }
    return d[a.length][b.length];
  }
  function damerauSim(a, b) {
    var m = Math.max(a.length, b.length);
    return m === 0 ? 1 : 1 - damerau(a, b) / m;
  }

  function jaro(a, b) {
    if (a === b) return 1;
    if (!a.length || !b.length) return 0;
    var win = Math.floor(Math.max(a.length, b.length) / 2) - 1;
    if (win < 0) win = 0;
    var aM = [], bM = [], matches = 0, i, j;
    for (i = 0; i < a.length; i++) {
      var lo = Math.max(0, i - win), hi = Math.min(i + win + 1, b.length);
      for (j = lo; j < hi; j++) {
        if (bM[j]) continue;
        if (a.charAt(i) !== b.charAt(j)) continue;
        aM[i] = bM[j] = true; matches++; break;
      }
    }
    if (!matches) return 0;
    var k = 0, trans = 0;
    for (i = 0; i < a.length; i++) {
      if (!aM[i]) continue;
      while (!bM[k]) k++;
      if (a.charAt(i) !== b.charAt(k)) trans++;
      k++;
    }
    trans = trans / 2;
    return (matches / a.length + matches / b.length + (matches - trans) / matches) / 3;
  }

  /* Winkler's 1990 refinement: JW = jaro + L * P * (1 - jaro), where L is the
     common prefix length CAPPED AT 4 and P is the prefix scale, default 0.1.
     P above 0.25 lets the score exceed 1, which is why 0.1 is the default. */
  var JW_PREFIX_CAP = 4;
  var JW_SCALE = 0.1;
  function jaroWinkler(a, b) {
    var j = jaro(a, b);
    var l = 0;
    while (l < Math.min(JW_PREFIX_CAP, a.length, b.length) && a.charAt(l) === b.charAt(l)) l++;
    return j + l * JW_SCALE * (1 - j);
  }

  function jaccard(a, b) {
    var A = {}, B = {}, i, inter = 0, uni = 0;
    a.split(" ").filter(Boolean).forEach(function (t) { A[t] = 1; });
    b.split(" ").filter(Boolean).forEach(function (t) { B[t] = 1; });
    var keys = {};
    for (i in A) keys[i] = 1;
    for (i in B) keys[i] = 1;
    for (i in keys) { uni++; if (A[i] && B[i]) inter++; }
    return uni === 0 ? 1 : inter / uni;
  }

  /* Soundex, per the Odell and Russell patents: keep the first letter, map the
     rest to digit codes, drop vowels, collapse repeats, pad to four. */
  var SOUNDEX_MAP = { b: 1, f: 1, p: 1, v: 1, c: 2, g: 2, j: 2, k: 2, q: 2, s: 2, x: 2, z: 2, d: 3, t: 3, l: 4, m: 5, n: 5, r: 6 };
  function soundex(s) {
    var t = (s || "").toLowerCase().replace(/[^a-z]/g, "");
    if (!t) return "";
    var first = t.charAt(0), out = "", prev = SOUNDEX_MAP[first] || 0;
    for (var i = 1; i < t.length; i++) {
      var c = t.charAt(i), code = SOUNDEX_MAP[c] || 0;
      if (c === "h" || c === "w") continue;             /* transparent */
      if (code && code !== prev) out += code;
      if (!"aeiouy".includes(c) || code) prev = code;
      if ("aeiouy".includes(c)) prev = 0;
    }
    return (first.toUpperCase() + out + "000").slice(0, 4);
  }
  function soundexSim(a, b) {
    var at = a.split(" ").filter(Boolean), bt = b.split(" ").filter(Boolean);
    if (!at.length || !bt.length) return 0;
    var hits = 0;
    at.forEach(function (t) {
      var code = soundex(t);
      if (bt.some(function (u) { return soundex(u) === code; })) hits++;
    });
    return hits / Math.max(at.length, bt.length);
  }

  var METRICS = {
    exact: { label: "Exact match", fn: function (a, b) { return a === b && a !== "" ? 1 : 0; } },
    lev: { label: "Levenshtein", fn: levSim },
    dam: { label: "Damerau-Levenshtein", fn: damerauSim },
    jaro: { label: "Jaro", fn: jaro },
    jw: { label: "Jaro-Winkler", fn: jaroWinkler },
    jac: { label: "Jaccard on tokens", fn: jaccard },
    sdx: { label: "Soundex", fn: soundexSim }
  };

  /* ------------------------------------------------------------------ *
   * 4. Fellegi-Sunter
   * ------------------------------------------------------------------ */

  /* m = P(field agrees | the pair IS a match)   - the data-error rate
     u = P(field agrees | the pair is NOT one)   - chance agreement
     These stand in for what Splink estimates with EM on a real corpus, and the
     page says so. Everything computed FROM them is real arithmetic. */
  var FIELDS = [
    { key: "name", label: "Name", m: 0.92, u: 0.02, thr: 0.90, metric: "jw" },
    { key: "email", label: "Email", m: 0.55, u: 0.001, thr: 1.00, metric: "exact" },
    { key: "phone", label: "Phone", m: 0.88, u: 0.002, thr: 0.90, metric: "lev" },
    { key: "addr", label: "Address", m: 0.80, u: 0.01, thr: 0.85, metric: "jac" },
    { key: "co", label: "Company", m: 0.95, u: 0.06, thr: 0.90, metric: "jw" }
  ];
  var PRIOR = TRUE_PAIRS / ALL_PAIRS;

  function log2(x) { return Math.log(x) / Math.LN2; }
  function agreeWeight(f) { return log2(f.m / f.u); }
  function disagreeWeight(f) { return log2((1 - f.m) / (1 - f.u)); }
  function priorWeight() { return log2(PRIOR / (1 - PRIOR)); }

  function normFor(key, rec, on) {
    if (key === "name") return normName(rec.name, on);
    if (key === "email") return normEmail(rec.email, on);
    if (key === "phone") return normPhone(rec.phone, on);
    if (key === "addr") return normAddr(rec.addr, on);
    return normCo(rec.co, on);
  }

  function scorePair(a, b, cfg) {
    var total = priorWeight(), detail = [];
    FIELDS.forEach(function (f) {
      if (!cfg.fields[f.key]) return;
      var metricKey = (f.key === "name" && cfg.nameMetric) ? cfg.nameMetric : f.metric;
      var va = normFor(f.key, a, cfg.normalize), vb = normFor(f.key, b, cfg.normalize);
      var sim, agree;
      if (va === "" || vb === "") {
        /* a missing value is not agreement and not disagreement - it carries no
           evidence, so it contributes nothing rather than a penalty */
        detail.push({ f: f.label, sim: null, w: 0, missing: true });
        return;
      }
      sim = METRICS[metricKey].fn(va, vb);
      agree = sim >= (metricKey === "exact" ? 1 : f.thr);
      var w = agree ? agreeWeight(f) : disagreeWeight(f);
      total += w;
      detail.push({ f: f.label, sim: sim, w: w, agree: agree });
    });
    return { weight: total, detail: detail };
  }

  /* ------------------------------------------------------------------ *
   * 5. Blocking
   * ------------------------------------------------------------------ */

  function surnameKey(r) {
    var t = normName(r.name, true).split(" ").filter(Boolean);
    return t.length ? soundex(t[t.length - 1]) : "";
  }

  var BLOCKERS = {
    none: {
      label: "None (all pairs)",
      pairs: function () {
        var out = [];
        for (var i = 0; i < N; i++) for (var j = i + 1; j < N; j++) out.push([i, j]);
        return out;
      }
    },
    surname: {
      label: "Soundex of surname",
      pairs: function () {
        var buckets = {}, out = [];
        RECORDS.forEach(function (r, i) {
          var k = surnameKey(r);
          (buckets[k] = buckets[k] || []).push(i);
        });
        Object.keys(buckets).forEach(function (k) {
          var b = buckets[k];
          for (var i = 0; i < b.length; i++) for (var j = i + 1; j < b.length; j++) out.push([b[i], b[j]]);
        });
        return out;
      }
    },
    zip: {
      label: "Postcode",
      pairs: function () {
        var buckets = {}, out = [];
        RECORDS.forEach(function (r, i) { (buckets[r.zip] = buckets[r.zip] || []).push(i); });
        Object.keys(buckets).forEach(function (k) {
          var b = buckets[k];
          for (var i = 0; i < b.length; i++) for (var j = i + 1; j < b.length; j++) out.push([b[i], b[j]]);
        });
        return out;
      }
    },
    sortnb: {
      label: "Sorted neighbourhood, window 5",
      pairs: function () {
        var order = RECORDS.map(function (r, i) { return { i: i, k: normName(r.name, true) }; });
        order.sort(function (x, y) { return x.k < y.k ? -1 : x.k > y.k ? 1 : 0; });
        var W = 5, out = [];
        for (var a = 0; a < order.length; a++) {
          for (var b = a + 1; b < Math.min(a + W, order.length); b++) {
            var lo = Math.min(order[a].i, order[b].i), hi = Math.max(order[a].i, order[b].i);
            out.push([lo, hi]);
          }
        }
        /* a record can appear in several windows, so dedupe */
        var seen = {}, dedup = [];
        out.forEach(function (p) {
          var k = p[0] + ":" + p[1];
          if (!seen[k]) { seen[k] = 1; dedup.push(p); }
        });
        return dedup;
      }
    }
  };

  /* ------------------------------------------------------------------ *
   * 6. Run
   * ------------------------------------------------------------------ */

  function connectedComponents(matchPairs) {
    var parent = [];
    for (var i = 0; i < N; i++) parent[i] = i;
    function find(x) { while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; } return x; }
    function union(a, b) { var ra = find(a), rb = find(b); if (ra !== rb) parent[ra] = rb; }
    matchPairs.forEach(function (p) { union(p.i, p.j); });
    var roots = {};
    for (i = 0; i < N; i++) roots[find(i)] = 1;
    return Object.keys(roots).length;
  }

  function run(cfg) {
    var cand = BLOCKERS[cfg.blocker].pairs();
    var candTrue = 0;
    cand.forEach(function (p) { if (RECORDS[p[0]].eid === RECORDS[p[1]].eid) candTrue++; });

    var rows = [], tp = 0, fp = 0, review = 0, matched = [];
    cand.forEach(function (p) {
      var a = RECORDS[p[0]], b = RECORDS[p[1]];
      var s = scorePair(a, b, cfg);
      var isTrue = a.eid === b.eid;
      var verdict;
      if (s.weight >= cfg.upper) verdict = "match";
      else if (s.weight >= cfg.lower && cfg.useReview) verdict = "review";
      else verdict = "non";
      if (verdict === "match") {
        matched.push({ i: p[0], j: p[1] });
        if (isTrue) tp++; else fp++;
      }
      if (verdict === "review") review++;
      rows.push({ a: a, b: b, weight: s.weight, detail: s.detail, isTrue: isTrue, verdict: verdict });
    });

    var fn = TRUE_PAIRS - tp;
    var tn = ALL_PAIRS - tp - fp - fn;
    var precision = (tp + fp) === 0 ? 1 : tp / (tp + fp);
    var recall = TRUE_PAIRS === 0 ? 1 : tp / TRUE_PAIRS;
    var f1 = (precision + recall) === 0 ? 0 : 2 * precision * recall / (precision + recall);
    var accuracy = (tp + tn) / ALL_PAIRS;

    var clusters = cfg.transitive ? connectedComponents(matched)
      : (N - matched.length > 0 ? "n/a" : "n/a");

    rows.sort(function (x, y) { return y.weight - x.weight; });

    return {
      cand: cand.length,
      pc: TRUE_PAIRS === 0 ? 1 : candTrue / TRUE_PAIRS,
      rr: 1 - cand.length / ALL_PAIRS,
      pq: cand.length === 0 ? 0 : candTrue / cand.length,
      tp: tp, fp: fp, fn: fn, tn: tn,
      precision: precision, recall: recall, f1: f1, accuracy: accuracy,
      review: review, clusters: clusters, rows: rows
    };
  }

  /* ------------------------------------------------------------------ *
   * 7. The bench UI
   * ------------------------------------------------------------------ */

  var PRESETS = {
    good: { fields: { name: 1, email: 1, phone: 1, addr: 1, co: 1 }, nameMetric: "jw", normalize: true, blocker: "none", upper: 4, lower: -2, useReview: true, transitive: false },
    emailOnly: { fields: { email: 1 }, nameMetric: "jw", normalize: true, blocker: "none", upper: 0, lower: -4, useReview: false, transitive: false },
    naive: { fields: { name: 1 }, nameMetric: "exact", normalize: false, blocker: "none", upper: -1, lower: -4, useReview: false, transitive: false }
  };

  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  function buildBench(host) {
    var cfg = clone(PRESETS.good);

    host.innerHTML = '' +
      '<div class="er-honesty"><b>Measured, not scripted.</b> Jaro-Winkler, Levenshtein, Jaccard ' +
      'and Soundex are real implementations here, running over ' + N + ' records covering ' +
      TRUE_ENTITIES + ' true people and ' + TRUE_PAIRS + ' true pairs. Precision, recall and the ' +
      'blocking figures are computed against those labels. The m and u table is a stand-in for ' +
      'what Splink would estimate with EM on your own data.</div>' +
      '<div class="er-board">' +
        '<div class="er-tile"><span class="er-k">Precision</span><span class="er-v" id="erP">-</span><span class="er-note">of pairs called a match</span></div>' +
        '<div class="er-tile"><span class="er-k">Recall</span><span class="er-v" id="erR">-</span><span class="er-note">of the ' + TRUE_PAIRS + ' true pairs</span></div>' +
        '<div class="er-tile"><span class="er-k">F1</span><span class="er-v" id="erF">-</span><span class="er-note">the number to report</span></div>' +
        '<div class="er-tile er-bad"><span class="er-k">Accuracy</span><span class="er-v" id="erA">-</span><span class="er-note">the number never to report</span></div>' +
        '<div class="er-tile er-flag"><span class="er-k">Clerical band</span><span class="er-v" id="erRev">-</span><span class="er-note">pairs sent to a human</span></div>' +
      '</div>' +
      '<div class="er-board">' +
        '<div class="er-tile"><span class="er-k">Pairs compared</span><span class="er-v" id="erC">-</span><span class="er-note">of ' + ALL_PAIRS + ' possible</span></div>' +
        '<div class="er-tile"><span class="er-k">Pair completeness</span><span class="er-v" id="erPC">-</span><span class="er-note">true pairs blocking kept</span></div>' +
        '<div class="er-tile"><span class="er-k">Reduction ratio</span><span class="er-v" id="erRR">-</span><span class="er-note">comparisons avoided</span></div>' +
        '<div class="er-tile"><span class="er-k">Pairs quality</span><span class="er-v" id="erPQ">-</span><span class="er-note">candidates worth scoring</span></div>' +
        '<div class="er-tile"><span class="er-k">Clusters</span><span class="er-v" id="erCl">-</span><span class="er-note">against ' + TRUE_ENTITIES + ' true people</span></div>' +
      '</div>' +
      '<div class="er-btns">' +
        '<button class="er-btn er-primary" id="erGood">A sensible configuration</button>' +
        '<button class="er-btn er-warn" id="erEmail">Match on email only</button>' +
        '<button class="er-btn er-warn" id="erNaive">Exact name only</button>' +
      '</div>' +
      '<div class="er-ctl" id="erCtl"></div>' +
      '<div class="er-legend">' +
        '<span>Correct match</span><span>False match</span><span>Missed pair</span><span>Clerical review</span>' +
      '</div>' +
      '<div class="er-pairs" id="erPairs"></div>';

    var ctl = host.querySelector("#erCtl");

    function grp(title, inner, cls) {
      return '<div class="er-grp' + (cls ? " " + cls : "") + '"><b>' + title + '</b>' + inner + '</div>';
    }
    ctl.innerHTML =
      grp("Fields compared", FIELDS.map(function (f) {
        return '<label><input type="checkbox" data-field="' + f.key + '">' + f.label + "</label>";
      }).join("")) +
      grp("Name comparison", '<select id="erMetric">' +
        ["exact", "lev", "dam", "jaro", "jw", "jac", "sdx"].map(function (k) {
          return '<option value="' + k + '">' + METRICS[k].label + "</option>";
        }).join("") + "</select>" +
        '<label style="margin-top:.4rem"><input type="checkbox" id="erNorm">Normalise first</label>') +
      grp("Blocking", '<select id="erBlock">' +
        Object.keys(BLOCKERS).map(function (k) {
          return '<option value="' + k + '">' + BLOCKERS[k].label + "</option>";
        }).join("") + "</select>") +
      grp("Thresholds (match weight)",
        '<div class="er-thr"><input type="range" id="erUp" min="-8" max="20" step="0.5"><span class="er-tv" id="erUpV"></span></div>' +
        '<div class="er-thr"><input type="range" id="erLo" min="-8" max="20" step="0.5"><span class="er-tv" id="erLoV"></span></div>' +
        '<label style="margin-top:.3rem"><input type="checkbox" id="erRevOn">Keep the clerical band</label>') +
      grp("Clustering", '<label><input type="checkbox" id="erTrans">Transitive closure</label>' +
        '<span class="er-note" style="font-size:.72rem;color:var(--muted)">chains every match together</span>', "er-anti");

    function sync() {
      FIELDS.forEach(function (f) {
        ctl.querySelector('[data-field="' + f.key + '"]').checked = !!cfg.fields[f.key];
      });
      ctl.querySelector("#erMetric").value = cfg.nameMetric;
      ctl.querySelector("#erNorm").checked = !!cfg.normalize;
      ctl.querySelector("#erBlock").value = cfg.blocker;
      ctl.querySelector("#erUp").value = cfg.upper;
      ctl.querySelector("#erLo").value = cfg.lower;
      ctl.querySelector("#erRevOn").checked = !!cfg.useReview;
      ctl.querySelector("#erTrans").checked = !!cfg.transitive;
    }

    function paint() {
      ctl.querySelector("#erUpV").textContent = (+cfg.upper).toFixed(1);
      ctl.querySelector("#erLoV").textContent = (+cfg.lower).toFixed(1);
      var r = run(cfg);
      host.querySelector("#erP").textContent = Math.round(r.precision * 100) + "%";
      host.querySelector("#erR").textContent = Math.round(r.recall * 100) + "%";
      host.querySelector("#erF").textContent = r.f1.toFixed(2);
      host.querySelector("#erA").textContent = (r.accuracy * 100).toFixed(1) + "%";
      host.querySelector("#erRev").textContent = cfg.useReview ? r.review : "off";
      host.querySelector("#erC").textContent = r.cand;
      host.querySelector("#erPC").textContent = Math.round(r.pc * 100) + "%";
      host.querySelector("#erRR").textContent = Math.round(r.rr * 100) + "%";
      host.querySelector("#erPQ").textContent = (r.pq * 100).toFixed(1) + "%";
      host.querySelector("#erCl").textContent = cfg.transitive ? r.clusters : "off";

      var box = host.querySelector("#erPairs");
      var show = r.rows.filter(function (x) {
        return x.verdict !== "non" || x.isTrue;
      }).slice(0, 60);
      if (!show.length) {
        box.innerHTML = '<p class="er-empty">No field is selected, so no pair can be scored.</p>';
        return;
      }
      box.innerHTML = show.map(function (x) {
        var v, cls = "";
        if (x.verdict === "match" && x.isTrue) v = '<span class="er-verdict er-tp">correct</span>';
        else if (x.verdict === "match") { v = '<span class="er-verdict er-fp">false</span>'; cls = " er-isfp"; }
        else if (x.verdict === "review") { v = '<span class="er-verdict er-rev">review</span>'; cls = " er-isrev"; }
        else v = '<span class="er-verdict er-fn">missed</span>';
        return '<div class="er-pair' + cls + '">' + v +
          '<span class="er-rec">' + x.a.name + " <i>" + (x.a.email || "no email") + "</i><br>" +
          x.b.name + " <i>" + (x.b.email || "no email") + "</i></span>" +
          '<span class="er-w">' + x.weight.toFixed(1) + "</span></div>";
      }).join("");
    }

    FIELDS.forEach(function (f) {
      ctl.querySelector('[data-field="' + f.key + '"]').addEventListener("change", function () {
        cfg.fields[f.key] = this.checked ? 1 : 0;
        if (!this.checked) delete cfg.fields[f.key];
        paint();
      });
    });
    ctl.querySelector("#erMetric").addEventListener("change", function () { cfg.nameMetric = this.value; paint(); });
    ctl.querySelector("#erNorm").addEventListener("change", function () { cfg.normalize = this.checked; paint(); });
    ctl.querySelector("#erBlock").addEventListener("change", function () { cfg.blocker = this.value; paint(); });
    ctl.querySelector("#erUp").addEventListener("input", function () { cfg.upper = +this.value; paint(); });
    ctl.querySelector("#erLo").addEventListener("input", function () { cfg.lower = +this.value; paint(); });
    ctl.querySelector("#erRevOn").addEventListener("change", function () { cfg.useReview = this.checked; paint(); });
    ctl.querySelector("#erTrans").addEventListener("change", function () { cfg.transitive = this.checked; paint(); });

    host.querySelector("#erGood").addEventListener("click", function () { cfg = clone(PRESETS.good); sync(); paint(); });
    host.querySelector("#erEmail").addEventListener("click", function () { cfg = clone(PRESETS.emailOnly); sync(); paint(); });
    host.querySelector("#erNaive").addEventListener("click", function () { cfg = clone(PRESETS.naive); sync(); paint(); });

    sync();
    paint();
    host.__cfg = function () { return cfg; };
    host.__set = function (c) { cfg = clone(c); sync(); paint(); };
  }

  /* ------------------------------------------------------------------ *
   * 8. The string-metric lab
   * ------------------------------------------------------------------ */

  var LAB_PRESETS = [
    ["Katherine", "Catherine", "the prefix boost cannot help"],
    ["Mary Ann", "Mray Ann", "a transposition"],
    ["Robert Chen", "Chen Robert", "token order"],
    ["Thomas Muller", "Thomas Mueller", "transliteration"],
    ["Smith", "Smyth", "same sound"],
    ["Priya Nair", "Priya Nayar", "same sound, different spelling"]
  ];

  function buildLab(host) {
    host.innerHTML = '' +
      '<div class="er-honesty"><b>Every number here is computed as you type.</b> Jaro-Winkler ' +
      'uses a prefix capped at ' + JW_PREFIX_CAP + ' characters and a scale of ' + JW_SCALE + ', ' +
      'which is Winkler\'s default.</div>' +
      '<div class="ml-presets" id="mlPre"></div>' +
      '<div class="ml-in">' +
        '<input id="mlA" spellcheck="false" value="Katherine">' +
        '<input id="mlB" spellcheck="false" value="Catherine">' +
      '</div>' +
      '<div class="ml-rows" id="mlRows"></div>' +
      '<p class="ml-code" id="mlCodes"></p>';

    var pre = host.querySelector("#mlPre");
    LAB_PRESETS.forEach(function (p) {
      var b = document.createElement("button");
      b.className = "ml-preset";
      b.type = "button";
      b.textContent = p[0] + " / " + p[1];
      b.title = p[2];
      b.addEventListener("click", function () {
        host.querySelector("#mlA").value = p[0];
        host.querySelector("#mlB").value = p[1];
        paint();
      });
      pre.appendChild(b);
    });

    var ORDER = ["exact", "lev", "dam", "jaro", "jw", "jac", "sdx"];
    var HINT = {
      exact: "1 or 0, nothing between",
      lev: "transposition costs two",
      dam: "transposition costs one",
      jaro: "matches within a window",
      jw: "Jaro, boosted by a shared prefix",
      jac: "token sets, order-free",
      sdx: "phonetic code per token"
    };

    function paint() {
      var a = host.querySelector("#mlA").value.toLowerCase().trim();
      var b = host.querySelector("#mlB").value.toLowerCase().trim();
      host.querySelector("#mlRows").innerHTML = ORDER.map(function (k) {
        var v = METRICS[k].fn(a, b);
        var cls = v >= 0.9 ? " ml-hi" : (v < 0.6 ? " ml-lo" : "");
        return '<div class="ml-row' + cls + '">' +
          '<span class="ml-n">' + METRICS[k].label + "<i>" + HINT[k] + "</i></span>" +
          '<span class="ml-bar"><span style="width:' + Math.round(v * 100) + '%"></span></span>' +
          '<span class="ml-v">' + v.toFixed(2) + "</span></div>";
      }).join("");
      host.querySelector("#mlCodes").textContent =
        "soundex: " + a.split(" ").filter(Boolean).map(soundex).join(" ") +
        "   vs   " + b.split(" ").filter(Boolean).map(soundex).join(" ");
    }

    host.querySelector("#mlA").addEventListener("input", paint);
    host.querySelector("#mlB").addEventListener("input", paint);
    paint();
  }

  /* ------------------------------------------------------------------ *
   * 9. The record table
   * ------------------------------------------------------------------ */

  function buildTable(host) {
    host.innerHTML = '<div class="er-scrollbox"><table class="er-recs">' +
      "<thead><tr><th>id</th><th>true id</th><th>name</th><th>email</th><th>phone</th><th>address</th></tr></thead><tbody>" +
      RECORDS.map(function (r) {
        return "<tr><td>" + r.id + '</td><td class="er-eid">e' + r.eid + "</td><td>" + r.name +
          "</td><td>" + (r.email || "-") + "</td><td>" + r.phone + "</td><td>" + r.addr + " " + r.zip + "</td></tr>";
      }).join("") + "</tbody></table></div>";
  }

  function boot() {
    var b = document.getElementById("er-bench");
    if (b) buildBench(b);
    var l = document.getElementById("er-lab");
    if (l) buildLab(l);
    var t = document.getElementById("er-records");
    if (t) buildTable(t);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  window.ER = {
    RECORDS: RECORDS, FIELDS: FIELDS, METRICS: METRICS, BLOCKERS: BLOCKERS,
    PRESETS: PRESETS, run: run, N: N, ALL_PAIRS: ALL_PAIRS,
    TRUE_PAIRS: TRUE_PAIRS, TRUE_ENTITIES: TRUE_ENTITIES,
    soundex: soundex, jaroWinkler: jaroWinkler, levSim: levSim
  };
})();
