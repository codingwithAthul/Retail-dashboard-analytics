import { MAX_NOTES, METRO, UBC_AREA, stockNotes, type AreaNumbers } from './stockNotes';
import { fsaArea, fsaNumbers } from './fsaCensus';
import { VANCOUVER_LISTINGS } from './vancouverListings';

const like = (over: Partial<AreaNumbers>): AreaNumbers => ({ ...METRO, ...over });
const titles = (a: AreaNumbers) => stockNotes(a).map((n) => n.title);

describe('stock notes from the neighbourhood census', () => {
  it('gives an average area one plain conclusion with its numbers', () => {
    const notes = stockNotes(METRO);
    expect(notes).toHaveLength(1);
    expect(notes[0].title).toBe('A typical Vancouver neighbourhood');
    expect(notes[0].evidence).toMatch(/^Median household income \$90,000 \(Metro \$90,000\)/);
    expect(notes[0].evidence).toMatch(/No figure is far enough from Metro Vancouver to change the shelves\.$/);
    expect(notes[0].detail).toMatch(/^Run the standard Shoppers range as it is\./);
    expect(stockNotes(like({ medianHouseholdIncome: 103000 }))[0].detail).toMatch(
      /Incomes are about 14% above Metro: keep premium beauty and vitamins at their usual space, but don't add more\./,
    );
    expect(stockNotes(like({ medianHouseholdIncome: 79000 }))[0].detail).toMatch(
      /Incomes are about 12% below Metro: keep Life Brand and no name easy to find, but don't add more space for them\./,
    );
  });

  it('flags an older area with the share of seniors and a pharmacy call', () => {
    const [note] = stockNotes(like({ seniors: 25.2 }));
    expect(note.title).toBe('Older than most of Vancouver');
    expect(note.evidence).toBe('About 1 in 4 residents is 65 or older (25.2%), against 17.4% across Metro Vancouver.');
    expect(note.detail).toBe(
      'About 45% more seniors than Metro: give home health care, incontinence and mobility aids a full bay, and offer blister packs and medication reviews at the pharmacy.',
    );
    expect(note.categories).toContain('OTC health');
  });

  it('reads the median age as a midpoint in plain words', () => {
    const [note] = stockNotes(like({ medianAge: 33.4 }));
    expect(note.evidence).toBe('Half the residents are younger than 33.4. Across Metro Vancouver the midpoint is 40.8.');
  });

  it('calls families and child-free areas', () => {
    expect(titles(like({ householdsWithChildren: 34 }))).toEqual(['A family neighbourhood']);
    const [few] = stockNotes(like({ children: 6.2 }));
    expect(few.title).toBe('Few children');
    expect(few.detail).toBe(
      "Under half Metro's share of children: cut baby care to diapers, wipes and formula and give the space to adult personal care, but keep those three fully stocked.",
    );
  });

  it('puts small households ahead of a low household income they explain', () => {
    const t = titles(like({ onePersonHouseholds: 52, medianHouseholdIncome: 60000 }));
    expect(t).toEqual(['Mostly people living alone']);
    // A high low-income share still counts.
    expect(titles(like({ onePersonHouseholds: 52, lowIncome: 22 }))).toContain('Price matters here');
  });

  it('names the main home language when it is well above Metro', () => {
    const [note] = stockNotes(
      like({ homeLanguages: [{ name: 'Cantonese', share: 24.6 }], noEnglishOrFrench: 12.3 }),
    );
    expect(note.title).toBe('Many speak Cantonese at home');
    expect(note.evidence).toMatch(/^About 1 in 4 residents speaks Cantonese most often at home \(24\.6%\), against 5\.0%/);
    expect(note.evidence).toMatch(/12\.3% speak neither English nor French/);
    expect(note.detail).toMatch(/^About 5 times Metro's share of Cantonese speakers: have a Cantonese-speaking staff member/);
  });

  it('opens every call with the gap to Metro, then what to do', () => {
    const calls = [
      like({ medianAge: 34.8 }),
      like({ householdsWithChildren: 34 }),
      like({ onePersonHouseholds: 57.2 }),
      like({ medianHouseholdIncome: 120000 }),
      like({ lowIncome: 23.5 }),
      like({ nonPermanentResidents: 12 }),
    ].map((a) => stockNotes(a)[0].detail);
    expect(calls).toEqual([
      'Residents are about 6 years younger than Metro: give more facings to skin care, trend cosmetics, sexual health and cold drinks, and take them from home health care.',
      "About 34% more households with children than Metro: keep diapers, formula and children's cold and fever medicine fully stocked, and never let them run out.",
      'About twice Metro\'s share of one-person households: sell single-serve meals and small packs of paper towel and detergent, but don\'t give space to bulk packs.',
      'Incomes are about 33% above Metro: give prestige beauty, premium vitamins and natural health more space, but keep Life Brand on the shelf.',
      'About twice Metro\'s share of people on a low income: lead with Life Brand and no name and keep flyer deals at the front, but don\'t drop the national brands.',
      "About 2.5 times Metro's share of students and temporary residents: stock travel sizes and first-apartment basics, and build stock before late August, when new students arrive.",
    ]);
  });

  it('ignores a home language that is common across Metro anyway', () => {
    expect(titles(like({ homeLanguages: [{ name: 'Mandarin', share: 9 }] }))).toEqual(['A typical Vancouver neighbourhood']);
  });

  it('shows at most three notes, strongest first', () => {
    const t = titles(
      like({ medianAge: 30, seniors: 9, onePersonHouseholds: 60, lowIncome: 30, nonPermanentResidents: 25 }),
    );
    expect(t).toHaveLength(MAX_NOTES);
    expect(t[0]).toBe('Many students and newcomers');
  });

  it('treats a missing figure as no signal', () => {
    expect(titles(like({ seniors: null, medianAge: null }))).toEqual(['A typical Vancouver neighbourhood']);
  });

  it('reads UBC as young and full of students', () => {
    const t = titles(UBC_AREA).join(' ');
    expect(t).toMatch(/Younger/);
    expect(t).toMatch(/students/);
  });

  it('has the census numbers and at least one note for every Vancouver store', () => {
    for (const l of VANCOUVER_LISTINGS) {
      expect(fsaArea(l), l.id).toBeDefined();
      const notes = stockNotes(fsaNumbers(l)!);
      expect(notes.length, l.id).toBeGreaterThan(0);
      for (const n of notes) expect(n.evidence, l.id).toMatch(/Metro/);
    }
  });
});
