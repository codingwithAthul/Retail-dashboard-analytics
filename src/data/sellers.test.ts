import { CHAIN_PROFILES, profileFor, shelfCalls } from './sellers';
import { nearbyFor, type NearbyPlace } from './nearby';
import { VANCOUVER_LISTINGS } from './vancouverListings';

const place = (name: string, kind: NearbyPlace['kind'], distanceM = 200, loblaw: string | null = null): NearbyPlace => ({
  name,
  kind,
  loblaw,
  coords: [49.28, -123.12],
  distanceM,
  osm: `n${name.length}${distanceM}`,
});

describe('what nearby places mainly sell', () => {
  it('every chain profile cites at least one source and names what it is strong in', () => {
    for (const c of CHAIN_PROFILES) {
      expect(c.sources.length, c.chain).toBeGreaterThan(0);
      for (const s of c.sources) expect(s.url, c.chain).toMatch(/^https:\/\//);
      expect(c.mainlySells, c.chain).not.toBe('');
      for (const s of c.strong) expect(c.sells, `${c.chain} ${s}`).toContain(s);
    }
  });

  it('matches chains by name, whatever the spelling on the map', () => {
    expect(profileFor(place('Save-On-Foods', 'Supermarket')).chain).toBe('Save-On-Foods');
    expect(profileFor(place('Save-On-Foods Pharmacy', 'Pharmacy')).chain).toBe('Save-On-Foods');
    expect(profileFor(place('大統華 T&T Supermarket', 'Supermarket')).chain).toBe('T&T Supermarket');
    expect(profileFor(place('Pure Intergrative Pharmacy', 'Pharmacy')).chain).toBe('Pure Integrative Pharmacy');
    expect(profileFor(place('Fresh Street Market', 'Supermarket')).chain).toBe('Fresh St. Market');
    expect(profileFor(place('Yale I.D.A. Pharmacy', 'Pharmacy')).chain).toBe('Banner pharmacy');
    expect(profileFor(place('PharmaPlus Rx', 'Pharmacy')).chain).toBe('Rexall');
    expect(profileFor(place('Loblaw Pharmacy', 'Pharmacy')).chain).toBe('Loblaws City Market');
  });

  it('marks chains as checked and independents as inferred from the map', () => {
    const chain = profileFor(place('Urban Fare', 'Supermarket'));
    expect(chain.confidence).toBe('verified');
    expect(chain.strong).toContain('Fresh grocery');

    const shop = profileFor(place('Danial Market', 'Supermarket'));
    expect(shop.confidence).toBe('inferred');
    expect(shop.chain).toBeUndefined();
    expect(shop.strong).toEqual([]);

    const pharmacy = profileFor(place('Davie Pharmacy', 'Pharmacy'));
    expect(pharmacy.confidence).toBe('inferred');
    expect(pharmacy.strong).toEqual(['Pharmacy']);
  });

  it('reads a produce shop or a butcher from the name, and says so', () => {
    const produce = profileFor(place('Money BBQ & Produce', 'Supermarket'));
    expect(produce.mainlySells).toMatch(/produce/i);
    expect(produce.basis).toBe('name');
    expect(profileFor(place('Jood Halal Meats And Grocery', 'Supermarket')).mainlySells).toMatch(/meat/i);
  });

  it('profiles every chain that appears near the stores', () => {
    const names = new Set(VANCOUVER_LISTINGS.flatMap((l) => nearbyFor(l.id)!.places.map((p) => p.name)));
    for (const n of ['London Drugs', 'Pharmasave', 'IGA', 'Urban Fare', 'Rexall', 'Nesters Market', 'Loblaws', 'Safeway', 'No Frills', 'Whole Foods Market', 'Choices Market', 'H Mart', 'Sungiven Foods', 'Kin\'s Farm Market']) {
      expect(names.has(n), n).toBe(true);
      expect(profileFor(place(n, 'Supermarket')).chain, n).toBeDefined();
    }
  });
});

describe('shelf calls from the neighbours', () => {
  it('avoids fresh grocery when a full supermarket is within a 10-minute walk', () => {
    const calls = shelfCalls([place('Save-On-Foods', 'Supermarket', 350)]);
    const fresh = calls.find((c) => c.category === 'Fresh grocery')!;
    expect(fresh.decision).toBe('Avoid');
    expect(fresh.rival).toBe('Save-On-Foods, 350 m');
  });

  it('only differentiates when the nearby grocers are small independents', () => {
    const fresh = shelfCalls([place('Danial Market', 'Supermarket', 200)]).find((c) => c.category === 'Fresh grocery')!;
    expect(fresh.decision).toBe('Differentiate');
  });

  it('competes on fresh grocery when there is no grocer at all', () => {
    const fresh = shelfCalls([]).find((c) => c.category === 'Fresh grocery')!;
    expect(fresh.decision).toBe('Compete');
    expect(fresh.rival).toBe('None within 800 m');
  });

  it('differentiates ready-to-eat food only when a ready-meal counter is very close', () => {
    const near = shelfCalls([place('Urban Fare', 'Supermarket', 300)]).find((c) => c.category === 'Convenience food')!;
    const far = shelfCalls([place('Urban Fare', 'Supermarket', 700)]).find((c) => c.category === 'Convenience food')!;
    expect(near.decision).toBe('Differentiate');
    expect(far.decision).toBe('Compete');
  });

  it('always competes in the core pharmacy categories and names the nearest rival', () => {
    const calls = shelfCalls([place('Davie Pharmacy', 'Pharmacy', 120), place('London Drugs', 'Pharmacy', 400)]);
    const pharmacy = calls.find((c) => c.category === 'Pharmacy')!;
    expect(pharmacy.decision).toBe('Compete');
    expect(pharmacy.rival).toBe('Davie Pharmacy, 120 m');
    expect(pharmacy.reason).toMatch(/2 other pharmacies/);
    expect(calls.find((c) => c.category === 'Beauty')!.rival).toBe('London Drugs, 400 m');
  });

  it('ignores other Shoppers Drug Mart stores: they are the same offer', () => {
    const calls = shelfCalls([place('Shoppers Drug Mart', 'Pharmacy', 100, 'Shoppers Drug Mart')]);
    expect(calls.find((c) => c.category === 'Pharmacy')!.rival).toBe('None within 800 m');
  });

  it('gives every store one call per category', () => {
    for (const l of VANCOUVER_LISTINGS) {
      const calls = shelfCalls(nearbyFor(l.id)!.places);
      expect(calls.map((c) => c.category)).toEqual([
        'Pharmacy',
        'OTC health',
        'Beauty',
        'Personal care',
        'Convenience food',
        'Fresh grocery',
        'Household',
      ]);
    }
  });
});
