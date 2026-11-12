import { METRO, UBC_AREA, stockNotes, type AreaNumbers } from './stockNotes';
import { fsaArea } from './fsaCensus';
import { VANCOUVER_LISTINGS } from './vancouverListings';

const like = (over: Partial<AreaNumbers>): AreaNumbers => ({ ...METRO, ...over });

describe('stock notes from the neighbourhood census', () => {
  it('says nothing when the area looks like Metro Vancouver', () => {
    expect(stockNotes(METRO)).toEqual([]);
  });

  it('flags an older area for home health care', () => {
    const [note] = stockNotes(like({ medianAge: 46 }));
    expect(note.title).toMatch(/Older/);
    expect(note.categories).toContain('OTC health');
    expect(note.evidence).toBe('Median age 46.0, Metro Vancouver 40.8');
  });

  it('flags a younger area, renters, income, immigrants and temporary residents', () => {
    const titles = stockNotes(
      like({ medianAge: 33, renters: 60, medianHouseholdIncome: 60000, immigrants: 50, nonPermanentResidents: 12 }),
    ).map((n) => n.title);
    expect(titles).toEqual([
      expect.stringMatching(/Younger/),
      expect.stringMatching(/rent/),
      expect.stringMatching(/Lower income/),
      expect.stringMatching(/born outside Canada/),
      expect.stringMatching(/temporary residents/),
    ]);
  });

  it('flags a higher-income area for prestige beauty', () => {
    const [note] = stockNotes(like({ medianHouseholdIncome: 120000 }));
    expect(note.title).toMatch(/Higher income/);
    expect(note.categories).toContain('Beauty');
  });

  it('treats a missing figure as no signal', () => {
    expect(stockNotes(like({ medianAge: null, renters: null }))).toEqual([]);
  });

  it('reads UBC as young, renting and full of students', () => {
    const titles = stockNotes(UBC_AREA).map((n) => n.title).join(' ');
    expect(titles).toMatch(/Younger/);
    expect(titles).toMatch(/temporary residents/);
  });

  it('has the raw census numbers for every Vancouver store', () => {
    for (const l of VANCOUVER_LISTINGS) expect(fsaArea(l), l.id).toBeDefined();
  });
});
