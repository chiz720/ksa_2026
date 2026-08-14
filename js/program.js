/* ==========================================================================
   KSA 2026 — Programme data
   Source: KSA2026V2.xlsx (Sheet1)
   Every session below is transcribed from the master spreadsheet. Sentence
   case + obvious spelling corrections applied; times are unchanged.
   ========================================================================== */

const CONF = {
  name:    '33rd KSA Annual Scientific Conference',
  society: 'Kenya Society of Anaesthesiologists',
  theme:   'Safe Anaesthesia for All — Advancing Innovation, Equity and Resilience Across Diverse Healthcare Settings',
  venue:   'Sarova Whitesands Beach Resort & Spa, Mombasa',
  dates:   '19 – 21 August 2026',
  tz:      'Africa/Nairobi',
};

const DAYS = [
  { id: 'pre',  date: '2026-08-19', label: 'Wed 19 Aug', sub: 'Pre-Conference', color: '#00695c' },
  { id: 'day1', date: '2026-08-20', label: 'Thu 20 Aug', sub: 'Day 1',          color: '#0b6b35' },
  { id: 'day2', date: '2026-08-21', label: 'Fri 21 Aug', sub: 'Day 2',          color: '#1565c0' },
];

/* Track palette — one colour per parallel track, used for card accents. */
const TRACK_COLORS = {
  'Regional Anaesthesia Workshop':          '#c62828',
  'Paediatric Pain':                        '#e65100',
  'Capnography Workshop':                   '#00838f',
  'FATE Echocardiography':                  '#4527a0',
  'Patient Safety & Quality Care':          '#0b6b35',
  'Paediatrics':                            '#e65100',
  'Obstetrics':                             '#ad1457',
  'Pain':                                   '#6a1b9a',
  'Subspeciality & High-Risk Anaesthesia':  '#1565c0',
  'Regional Anaesthesia':                   '#c62828',
  'Crisis Management & Emergency Preparedness': '#b71c1c',
  'Critical Care':                          '#00695c',
  'Research / Education Papers':            '#4527a0',
  'Perioperative Critical Care':            '#00838f',
  'Panel Discussions':                      '#37474f',
};

/* --------------------------------------------------------------------------
   PROGRAMME
   Each day holds an ordered list of blocks.
     type: 'break'    — registration, tea, lunch, gala, AGM …
           'plenary'  — single-room session, everyone together
           'parallel' — 2+ tracks running side by side
   Sessions:  { s, e, title, speakers[], kind }
     kind: 'talk' | 'discussion' | 'ceremony' | 'panel'
   -------------------------------------------------------------------------- */
const PROGRAM = {

  /* ==================== PRE-CONFERENCE · WED 19 AUGUST ==================== */
  pre: [
    {
      type: 'plenary', s: '07:00', e: '07:50', room: 'Workshop rooms',
      title: 'Workshops — early start',
      sessions: [{ s: '07:00', e: '07:50', title: 'Workshops', speakers: [], kind: 'talk' }],
    },
    { type: 'break', s: '08:00', e: '08:30', title: 'Registration', icon: 'fa-id-badge', room: 'Main foyer' },

    {
      type: 'parallel', s: '08:30', e: '10:10',
      label: 'Pre-conference workshops — morning session',
      tracks: [
        {
          name: 'Regional Anaesthesia Workshop', room: 'Room 1',
          faculty: ["Dr. Caxton Ng'ang'a", 'Dr. Billow Mohammed'],
          sessions: [{ s: '08:30', e: '10:10', title: 'Regional Anaesthesia Workshop', speakers: ["Dr. Caxton Ng'ang'a", 'Dr. Billow Mohammed'], kind: 'talk' }],
        },
        {
          name: 'Paediatric Pain', room: 'Room 2',
          faculty: ['Dr. Mark Gacii', 'Society of Paediatric Anaesthesiologists'],
          sessions: [{ s: '08:30', e: '10:10', title: 'Paediatric Pain Workshop', speakers: ['Dr. Mark Gacii', 'Society of Paediatric Anaesthesiologists'], kind: 'talk' }],
        },
        {
          name: 'Capnography Workshop', room: 'Room 3',
          faculty: ['Dr. Zipporah Gathuya', 'Smile Train'],
          sponsor: 'smiletrain',
          sessions: [{ s: '08:30', e: '10:10', title: 'Capnography Workshop', speakers: ['Dr. Zipporah Gathuya', 'Smile Train'], kind: 'talk' }],
        },
        {
          name: 'FATE Echocardiography', room: 'Room 4',
          faculty: ['Dr. Kevin Umani', 'Dr. Isaac Adembesa'],
          sessions: [{ s: '08:30', e: '10:10', title: 'Focused Assessed Transthoracic Echocardiography (FATE)', speakers: ['Dr. Kevin Umani', 'Dr. Isaac Adembesa'], kind: 'talk' }],
        },
      ],
    },

    // Spreadsheet had tea 10:10–10:45 but the workshops restarting at 10:40.
    // Resolved the same way as the Day 2 afternoon: the session time wins and
    // the break is trimmed to fit, so tea ends at 10:40.
    { type: 'break', s: '10:10', e: '10:40', title: 'Tea Break', icon: 'fa-mug-hot' },

    {
      type: 'parallel', s: '10:40', e: '13:30',
      label: 'Pre-conference workshops — late morning session',
      tracks: [
        { name: 'Regional Anaesthesia Workshop', room: 'Room 1', faculty: ["Dr. Caxton Ng'ang'a", 'Dr. Billow Mohammed'],
          sessions: [{ s: '10:40', e: '13:30', title: 'Regional Anaesthesia Workshop (continued)', speakers: ["Dr. Caxton Ng'ang'a", 'Dr. Billow Mohammed'], kind: 'talk' }] },
        { name: 'Paediatric Pain', room: 'Room 2', faculty: ['Dr. Mark Gacii', 'Society of Paediatric Anaesthesiologists'],
          sessions: [{ s: '10:40', e: '13:30', title: 'Paediatric Pain Workshop (continued)', speakers: ['Dr. Mark Gacii'], kind: 'talk' }] },
        { name: 'Capnography Workshop', room: 'Room 3', faculty: ['Dr. Zipporah Gathuya', 'Smile Train'], sponsor: 'smiletrain',
          sessions: [{ s: '10:40', e: '13:30', title: 'Capnography Workshop (continued)', speakers: ['Dr. Zipporah Gathuya'], kind: 'talk' }] },
        { name: 'FATE Echocardiography', room: 'Room 4', faculty: ['Dr. Kevin Umani', 'Dr. Isaac Adembesa'],
          sessions: [{ s: '10:40', e: '13:30', title: 'FATE Workshop (continued)', speakers: ['Dr. Kevin Umani', 'Dr. Isaac Adembesa'], kind: 'talk' }] },
      ],
    },

    { type: 'break', s: '13:30', e: '14:30', title: 'Lunch', icon: 'fa-utensils' },

    {
      type: 'parallel', s: '14:30', e: '15:30',
      label: 'Pre-conference workshops — afternoon session',
      tracks: [
        { name: 'Regional Anaesthesia Workshop', room: 'Room 1', faculty: ["Dr. Caxton Ng'ang'a", 'Dr. Billow Mohammed'],
          sessions: [{ s: '14:30', e: '15:30', title: 'Regional Anaesthesia Workshop (afternoon)', speakers: ["Dr. Caxton Ng'ang'a", 'Dr. Billow Mohammed'], kind: 'talk' }] },
        { name: 'Paediatric Pain', room: 'Room 2', faculty: ['Dr. Mark Gacii', 'Society of Paediatric Anaesthesiologists'],
          sessions: [{ s: '14:30', e: '15:30', title: 'Paediatric Pain Workshop (afternoon)', speakers: ['Dr. Mark Gacii'], kind: 'talk' }] },
        { name: 'Capnography Workshop', room: 'Room 3', faculty: ['Dr. Zipporah Gathuya', 'Smile Train'], sponsor: 'smiletrain',
          sessions: [{ s: '14:30', e: '15:30', title: 'Capnography Workshop (afternoon)', speakers: ['Dr. Zipporah Gathuya'], kind: 'talk' }] },
        { name: 'FATE Echocardiography', room: 'Room 4', faculty: ['Dr. Kevin Umani', 'Dr. Isaac Adembesa'],
          sessions: [{ s: '14:30', e: '15:30', title: 'FATE Workshop (afternoon)', speakers: ['Dr. Kevin Umani', 'Dr. Isaac Adembesa'], kind: 'talk' }] },
      ],
    },

    {
      type: 'plenary', s: '16:00', e: '17:00', room: 'Plenary',
      title: 'Symposium', sponsor: 'fresenius',
      note: 'In partnership with Fresenius Kabi',
      sessions: [{ s: '16:00', e: '17:00', title: 'Symposium: Intraoperative Hypotension', speakers: ['Dr. Ruth Mbadi'], kind: 'talk' }],
    },
  ],

  /* ======================== DAY 1 · THU 20 AUGUST ======================== */
  day1: [
    {
      type: 'plenary', s: '07:00', e: '07:50', room: 'Baraza',
      title: 'Problem-Based Learning Discussion (PBLD)',
      sessions: [{ s: '07:00', e: '07:50', title: 'Problem-Based Learning Discussion', speakers: [], kind: 'talk' }],
    },

    {
      type: 'parallel', s: '08:30', e: '10:10',
      label: 'Morning tracks',
      tracks: [
        {
          name: 'Patient Safety & Quality Care', room: 'Room 1 — Baraza',
          chairs: ['Dr. Ivy Wanyoike', 'Dr. Elizabeth Nyakundi'],
          sessions: [
            { s: '08:30', e: '09:00', title: 'More than the ASA score: identifying the high-risk surgical patient', speakers: ['Dr. Matt Kynes'], kind: 'talk' },
            { s: '09:00', e: '09:30', title: 'Medication safety and error reduction in anaesthesia: lessons from recent incidents and evidence-based prevention strategies', speakers: ['Dr. Antony Gatheru'], kind: 'talk' },
            { s: '09:30', e: '10:00', title: 'M&M culture: learning from adverse events', speakers: ["Dr. Sammy Ng'ang'a"], kind: 'talk' },
            { s: '10:00', e: '10:10', title: 'Discussion', speakers: [], kind: 'discussion' },
          ],
        },
        {
          name: 'Paediatrics', room: 'Room 2 — Johari',
          chairs: ['Dr. Cynthia Odipo', 'Dr. Monali Thakkar'],
          sessions: [
            { s: '08:30', e: '09:00', title: "Paediatric airway emergencies: preventing the 'can't intubate, can't ventilate' scenario", speakers: ['Dr. Shuweikha Salim', 'Dr. Cynthia Achola'], kind: 'talk' },
            { s: '09:00', e: '09:30', title: 'Neonatal & preterm anaesthesia: what really matters for safe outcomes', speakers: ['Dr. Zipporah Gathuya'], kind: 'talk' },
            { s: '09:30', e: '10:00', title: 'E-cigarette or vaping product use-associated lung injury (EVALI) in children — pathophysiology and anaesthetic management', speakers: ['Dr. Emma Mutio'], kind: 'talk' },
            { s: '10:00', e: '10:10', title: 'Discussion', speakers: [], kind: 'discussion' },
          ],
        },
      ],
    },

    { type: 'break', s: '10:10', e: '10:45', title: 'Tea Break', icon: 'fa-mug-hot' },

    {
      type: 'plenary', s: '10:45', e: '11:15', room: 'Baraza', highlight: true,
      title: 'Opening Ceremony',
      sessions: [{ s: '10:45', e: '11:15', title: 'Opening Ceremony & Dr. Madhu Patel Award', speakers: [], kind: 'ceremony' }],
    },

    {
      type: 'plenary', s: '11:15', e: '12:00', room: 'Baraza', highlight: true,
      title: 'Plenary',
      sessions: [{ s: '11:15', e: '12:00', title: 'Plenary: Safe obstetric anaesthesia in the rural setting — followed by Council of Governors panel discussion', speakers: ['Dr. Linda Nguu', 'Council of Governors Panel'], kind: 'panel' }],
    },

    {
      type: 'parallel', s: '12:00', e: '13:15',
      label: 'Midday tracks',
      tracks: [
        {
          name: 'Obstetrics', room: 'Room 1 — Baraza',
          chairs: ['Dr. Billow Mohammed', 'Dr. Jonathan Monda'],
          sessions: [
            { s: '12:00', e: '12:20', title: 'Airway management in obstetric patients', speakers: ['Suheil Juma'], kind: 'talk' },
            { s: '12:20', e: '12:40', title: 'Management of hypotension during spinal anaesthesia: practical strategies', speakers: ['Dr. Lesley Gesare', 'Dr. Charles Mwembu'], kind: 'talk' },
            { s: '12:40', e: '13:00', title: 'Last but not least: a toxic love story with local anaesthetics — an evidence-based update (2021–2026)', speakers: ['Dr. Sheila Kirongothi'], kind: 'talk' },
            { s: '13:00', e: '13:15', title: 'Discussion', speakers: [], kind: 'discussion' },
          ],
        },
        {
          name: 'Pain', room: 'Room 2 — Johari',
          chairs: ['Dr. Mayur Jotangia', 'Dr. Catherine Ndosi'],
          sessions: [
            { s: '12:00', e: '12:20', title: 'Paediatric pain management: pain assessment, safe analgesia dosing, procedural pain control', speakers: ['Dr. Eddy Mboya'], kind: 'talk' },
            { s: '12:20', e: '12:40', title: 'Interventional pain techniques for cancer pain: beyond the WHO analgesic ladder', speakers: ['Dr. Lee Ngugi'], kind: 'talk' },
            { s: '12:40', e: '13:00', title: 'Pain management at the end of life: what anaesthesiologists should know and do', speakers: ['Dr. Timothy Mwiti'], kind: 'talk' },
            { s: '13:00', e: '13:15', title: 'Discussion', speakers: [], kind: 'discussion' },
          ],
        },
      ],
    },

    {
      type: 'break', s: '13:15', e: '14:15', title: 'Lunch & Satellite Symposium', icon: 'fa-utensils',
      note: 'Satellite symposium: Why do we need better anaesthesia depth monitoring? — Dr. Aliya Mumin',
    },

    {
      type: 'parallel', s: '14:30', e: '15:45',
      label: 'Afternoon tracks',
      tracks: [
        {
          name: 'Subspeciality & High-Risk Anaesthesia', room: 'Room 1 — Baraza',
          chairs: ['Dr. Susan Omundi', 'Navneel Kaur'],
          sessions: [
            { s: '14:30', e: '14:50', title: 'Anaesthesia for major vascular surgery: abdominal aortic aneurysm', speakers: ['Dr. Kevin Umani'], kind: 'talk' },
            { s: '14:50', e: '15:10', title: 'Major haemorrhage — tranexamic acid: when and how', speakers: ['Dr. Cornell Sendagire'], kind: 'talk' },
            { s: '15:10', e: '15:30', title: 'Practical intraoperative management of raised ICP', speakers: ['Dr. Rebecca Dufe'], kind: 'talk' },
            { s: '15:30', e: '15:45', title: 'Discussion', speakers: [], kind: 'discussion' },
          ],
        },
        {
          name: 'Regional Anaesthesia', room: 'Room 2 — Johari',
          chairs: ['Dr. Teddy Were', 'Dr. Mmakgomo King'],
          sessions: [
            { s: '14:30', e: '14:50', title: 'Point-of-care ultrasound (POCUS) in anaesthesia practice: expanding the role of the anaesthesiologist in perioperative diagnosis and patient safety', speakers: ['Dr. Eunice Kageha'], kind: 'talk' },
            { s: '14:50', e: '15:10', title: 'Beyond the tube: the evolving role of spinal anaesthesia in laparoscopic surgery', speakers: ['Dr. Suman Bhargav Gadhara'], kind: 'talk' },
            { s: '15:10', e: '15:30', title: 'Paediatric spinal anaesthesia', speakers: ['Dr. Susane Nabulindo'], kind: 'talk' },
            { s: '15:30', e: '15:45', title: 'Discussion', speakers: [], kind: 'discussion' },
          ],
        },
      ],
    },

    {
      type: 'break', s: '15:45', e: '16:30', title: 'Tea Break & Poster Presentation', icon: 'fa-mug-hot',
      note: 'Poster judges: Dr. Stephen Okelo · Dr. Matt Kynes · Dr. Kituyi Werunga · Dr. Mark Gacii',
    },
    { type: 'break', s: '16:30', e: '18:30', title: 'Annual General Meeting (AGM)', icon: 'fa-users', room: 'Baraza' },
  ],

  /* ======================== DAY 2 · FRI 21 AUGUST ======================== */
  day2: [
    {
      type: 'plenary', s: '07:00', e: '07:50', room: 'Baraza',
      title: 'Problem-Based Learning Discussion (PBLD)',
      sessions: [{ s: '07:00', e: '07:50', title: 'Problem-Based Learning Discussion', speakers: [], kind: 'talk' }],
    },

    {
      type: 'parallel', s: '08:30', e: '10:10',
      label: 'Morning tracks',
      tracks: [
        {
          name: 'Crisis Management & Emergency Preparedness', room: 'Room 1 — Baraza',
          chairs: ['Dr. Evans Charana', 'Dr. Hazo Oginga'],
          sessions: [
            { s: '08:30', e: '09:00', title: 'Role of simulation in crisis management: preparing teams before patients need them', speakers: ['Dr. Cynthia Achola'], kind: 'talk' },
            { s: '09:00', e: '09:30', title: 'Leadership and decision-making in crisis management: the role of the anaesthesiologist', speakers: ['Dr. Rachael Kimani'], kind: 'talk' },
            { s: '09:30', e: '10:00', title: 'Beyond the golden hour: the critical role of the anaesthesiologist in pre-hospital care and aeromedical transport', speakers: ['Dr. Joseph Lelo'], kind: 'talk' },
            { s: '10:00', e: '10:10', title: 'Discussion', speakers: [], kind: 'discussion' },
          ],
        },
        {
          name: 'Critical Care', room: 'Room 2 — Johari',
          chairs: ['Dr. Edwin Gudu', 'Dr. Diana Manyura'],
          sessions: [
            { s: '08:30', e: '09:00', title: 'Understanding lung physiology through the ventilator screen', speakers: ['Dr. Idris Chikophe'], kind: 'talk' },
            { s: '09:00', e: '09:30', title: 'Ventilator asynchrony', speakers: ['Dr. David Odaba'], kind: 'talk' },
            { s: '09:30', e: '10:00', title: 'Volumetry in parenchymal lung disease', speakers: ['Dr. Idris Chikophe'], kind: 'talk' },
            { s: '10:00', e: '10:10', title: 'Discussion', speakers: [], kind: 'discussion' },
          ],
        },
      ],
    },

    { type: 'break', s: '10:10', e: '11:10', title: 'Tea Break', icon: 'fa-mug-hot' },

    {
      type: 'plenary', s: '11:10', e: '11:25', room: 'Baraza',
      title: 'Industry Talk', note: 'Courtesy of GE Healthcare',
      sessions: [{ s: '11:10', e: '11:25', title: 'The arterial line reimagined: transforming intraoperative hypotension into actionable haemodynamic intelligence', speakers: ['Dr. Isaac Adembesa'], kind: 'talk' }],
    },

    {
      type: 'plenary', s: '11:25', e: '12:00', room: 'Baraza', highlight: true,
      title: 'Plenary', chairs: ['Dr. Moses Gicheru'],
      sessions: [{ s: '11:25', e: '12:00', title: 'Managing the sick child in non-specialist centres: safe anaesthesia beyond the tertiary hospitals', speakers: ['Dr. Anthony Iraya'], kind: 'talk' }],
    },

    {
      type: 'parallel', s: '12:00', e: '13:15',
      label: 'Midday tracks',
      tracks: [
        {
          name: 'Research / Education Papers', room: 'Room 1 — Baraza',
          chairs: ['Angela Ongewe'],
          sessions: [
            { s: '12:00', e: '12:20', title: 'Agreement of clinical anaemia estimation vs point-of-care device in pregnant women undergoing elective caesarean section at the Aga Khan University Hospital, Nairobi', speakers: ['Dr. Samuel Yonga'], kind: 'talk' },
            { s: '12:20', e: '12:40', title: 'A randomized controlled trial investigating the risk of moderate to severe postoperative sore throat among Black female patients intubated with endotracheal tube size 6.0 compared to 7.0', speakers: ['Dr. Cynthia Odongo'], kind: 'talk' },
            { s: '12:40', e: '13:00', title: 'Epidural labour analgesia in a parturient with truncus arteriosus (Van Praagh type A-2) and severe pulmonary arterial hypertension with Eisenmenger physiology and heart failure (AHA stage D, NYHA class IV): a case report', speakers: ['Dr. Hussain Noorali Momin'], kind: 'talk' },
            { s: '13:00', e: '13:15', title: 'Discussion', speakers: [], kind: 'discussion' },
          ],
        },
        {
          name: 'Perioperative Critical Care', room: 'Room 2 — Johari',
          subtitle: 'Bridging theatre and ICU',
          chairs: ['Dr. Fiona-Hope Mtula', 'Dr. Bancy Njoki'],
          sessions: [
            { s: '12:00', e: '12:20', title: 'Perioperative Haemodynamic Optimization', speakers: ['Dr. Cornell Sendagire'], kind: 'talk' },
            { s: '12:20', e: '12:40', title: 'Bleeding, hypoxia and AKI', speakers: ['Dr. Caroline Jeptoo'], kind: 'talk' },
            { s: '12:40', e: '13:00', title: 'Beyond tick boxes: modernizing the WHO Surgical Safety Checklist — from compliance to culture in perioperative safety', speakers: ['Dr. Betelhem Hailu Belda'], kind: 'talk' },
            { s: '13:00', e: '13:15', title: 'Discussion', speakers: [], kind: 'discussion' },
          ],
        },
      ],
    },

    { type: 'break', s: '13:15', e: '14:15', title: 'Lunch', icon: 'fa-utensils' },

    {
      type: 'plenary', s: '14:15', e: '15:40', room: 'Baraza',
      title: 'Panel Discussions', track: 'Panel Discussions',
      sessions: [
        { s: '14:15', e: '15:00', title: 'Medical-legal challenges in anaesthesia practice', speakers: ['Advocate Roy Tollo', 'Advocate Naomi Kinuva', 'Dr. Mark Gacii'], kind: 'panel' },
        // Afternoon times confirmed by the organisers, overriding the spreadsheet's
        // block header ("1415-1530"), its 15:15–15:30 discussion row and its
        // 15:30 tea break: panel runs to 15:40, discussion 15:40–16:00,
        // tea 16:00–16:30.
        { s: '15:00', e: '15:40', title: 'Who gets the ICU bed? Ethical decision-making in resource-limited settings', speakers: ['Dr. Idris Chikophe', 'Dr. David Odaba'], kind: 'panel' },
        { s: '15:40', e: '16:00', title: 'Discussion', speakers: [], kind: 'discussion' },
      ],
    },

    { type: 'break', s: '16:00', e: '16:30', title: 'Tea Break', icon: 'fa-mug-hot' },
    { type: 'break', s: '18:00', e: '21:00', title: 'Gala Dinner', icon: 'fa-champagne-glasses', highlight: true },
  ],
};

/* --------------------------------------------------------------------------
   Derived structures — built once at load.
   -------------------------------------------------------------------------- */

/* Flat list of every timed item, used by search, my-schedule and the live bar. */
const FLAT = [];
DAYS.forEach(day => {
  (PROGRAM[day.id] || []).forEach((block, bi) => {
    if (block.type === 'break') {
      FLAT.push({
        id: `${day.id}-b${bi}`, dayId: day.id, date: day.date,
        s: block.s, e: block.e, title: block.title, speakers: [],
        room: block.room || '', track: '', kind: 'break', note: block.note || '',
      });
      return;
    }
    const groups = block.type === 'parallel'
      ? block.tracks.map(t => ({ track: t.name, room: t.room, chairs: t.chairs || [], sessions: t.sessions }))
      : [{ track: block.track || block.title, room: block.room || '', chairs: block.chairs || [], sessions: block.sessions }];

    groups.forEach((g, gi) => g.sessions.forEach((sess, si) => {
      FLAT.push({
        id: `${day.id}-${bi}-${gi}-${si}`, dayId: day.id, date: day.date,
        s: sess.s, e: sess.e, title: sess.title, speakers: sess.speakers || [],
        room: g.room, track: g.track, chairs: g.chairs, kind: sess.kind,
      });
    }));
  });
});

/* Faculty index — who speaks, who chairs, and where. */
const FACULTY = (() => {
  const map = new Map();
  const add = (name, role, entry) => {
    const key = name.trim();
    if (!key || /^society of|^council of|^smile train|^panel$/i.test(key)) return;
    if (!map.has(key)) map.set(key, { name: key, talks: [], chairs: [] });
    map.get(key)[role].push(entry);
  };
  FLAT.forEach(f => {
    if (f.kind === 'break' || f.kind === 'discussion') return;
    (f.speakers || []).forEach(n => add(n, 'talks', f));
    (f.chairs || []).forEach(n => add(n, 'chairs', f));
  });
  // Workshop faculty that never appear as session speakers
  DAYS.forEach(d => (PROGRAM[d.id] || []).forEach(b => {
    if (b.type !== 'parallel') return;
    b.tracks.forEach(t => (t.faculty || []).forEach(n => add(n, 'talks', {
      title: t.name, dayId: d.id, s: b.s, e: b.e, room: t.room, track: t.name,
    })));
  }));
  // Chairs are attached to every session in their track — keep one entry per track.
  map.forEach(p => {
    const seen = new Set();
    p.chairs = p.chairs.filter(c => {
      const k = c.dayId + '|' + c.track;
      return seen.has(k) ? false : (seen.add(k), true);
    });
    // Workshop leads are listed both as session speakers and as track faculty —
    // one slot can only be one talk, so keep the first (most specific) entry.
    const seenT = new Set();
    p.talks = p.talks.filter(t => {
      const k = t.dayId + '|' + t.s + '|' + t.track;
      return seenT.has(k) ? false : (seenT.add(k), true);
    });
  });
  return [...map.values()].sort((a, b) => {
    const ln = s => s.name.replace(/^(Dr\.|Prof\.|Advocate)\s+/i, '');
    return ln(a).localeCompare(ln(b));
  });
})();

/* Session list for the Q&A dropdown — talks and panels only. */
const QA_SESSIONS = FLAT
  .filter(f => f.kind === 'talk' || f.kind === 'panel' || f.kind === 'ceremony')
  .map(f => ({
    value: `${DAYS.find(d => d.id === f.dayId).label} ${f.s} — ${f.title.slice(0, 70)}`,
    dayId: f.dayId, s: f.s, track: f.track,
  }));
