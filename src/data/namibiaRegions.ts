export interface TownInfo {
  name: string;
  courtName: string;
  courtDivision: string;
}

export interface RegionInfo {
  region: string;
  towns: TownInfo[];
}

export const NAMIBIA_REGIONS: RegionInfo[] = [
  {
    region: 'Erongo',
    towns: [
      { name: 'Swakopmund', courtName: 'Swakopmund Magistrate & Circuit High Court', courtDivision: 'High Court Main & Circuit Division' },
      { name: 'Walvis Bay', courtName: 'Walvis Bay Regional Magistrate Court', courtDivision: 'Subordinate Court Division' },
      { name: 'Henties Bay', courtName: 'Henties Bay Periodic Court', courtDivision: 'Periodic Court' },
      { name: 'Omaruru', courtName: 'Omaruru Magistrate Court', courtDivision: 'Subordinate Court Division' },
      { name: 'Karibib', courtName: 'Karibib Periodic Court', courtDivision: 'Periodic Court' },
      { name: 'Usakos', courtName: 'Usakos Magistrate Court', courtDivision: 'Subordinate Court Division' },
      { name: 'Arandis', courtName: 'Arandis Periodic Court', courtDivision: 'Periodic Court' },
    ],
  },
  {
    region: 'Hardap',
    towns: [
      { name: 'Mariental', courtName: 'Mariental Regional Magistrate Court', courtDivision: 'Regional Division' },
      { name: 'Rehoboth', courtName: 'Rehoboth Magistrate Court', courtDivision: 'Subordinate Court Division' },
      { name: 'Maltahöhe', courtName: 'Maltahöhe Magistrate Court', courtDivision: 'Subordinate Court Division' },
      { name: 'Aranos', courtName: 'Aranos Periodic Court', courtDivision: 'Periodic Court' },
      { name: 'Gibeon', courtName: 'Gibeon Magistrate Court', courtDivision: 'Subordinate Court Division' },
    ],
  },
  {
    region: 'Kavango East',
    towns: [
      { name: 'Rundu', courtName: 'Rundu Regional Magistrate Court', courtDivision: 'Regional Division' },
      { name: 'Divundu', courtName: 'Divundu Periodic Court', courtDivision: 'Periodic Court' },
      { name: 'Ndiyona', courtName: 'Ndiyona Periodic Court', courtDivision: 'Periodic Court' },
    ],
  },
  {
    region: 'Kavango West',
    towns: [
      { name: 'Nkurenkuru', courtName: 'Nkurenkuru Magistrate Court', courtDivision: 'Subordinate Court Division' },
      { name: 'Mpungu', courtName: 'Mpungu Periodic Court', courtDivision: 'Periodic Court' },
      { name: 'Tondoro', courtName: 'Tondoro Periodic Court', courtDivision: 'Periodic Court' },
    ],
  },
  {
    region: 'Khomas',
    towns: [
      { name: 'Windhoek', courtName: 'Supreme & High Court of Namibia (Main Division)', courtDivision: 'Superior Courts' },
      { name: 'Katutura', courtName: 'Katutura Regional Magistrate Court', courtDivision: 'Regional Division' },
      { name: 'Windhoek Rural', courtName: 'Windhoek Rural Periodic Court', courtDivision: 'Periodic Court' },
      { name: 'Tobias Hainyeko', courtName: 'Tobias Hainyeko Community Court Station', courtDivision: 'Community Station' },
      { name: 'Moses Garoeb', courtName: 'Moses Garoeb Community Court Station', courtDivision: 'Community Station' },
      { name: 'Samora Machel', courtName: 'Samora Machel Legal Aid Station', courtDivision: 'Subordinate Division' },
    ],
  },
  {
    region: 'Kunene',
    towns: [
      { name: 'Opuwo', courtName: 'Opuwo Regional Magistrate Court', courtDivision: 'Regional Division' },
      { name: 'Outjo', courtName: 'Outjo Magistrate Court', courtDivision: 'Subordinate Court Division' },
      { name: 'Khorixas', courtName: 'Khorixas Magistrate Court', courtDivision: 'Subordinate Court Division' },
      { name: 'Kamanjab', courtName: 'Kamanjab Periodic Court', courtDivision: 'Periodic Court' },
    ],
  },
  {
    region: 'Ohangwena',
    towns: [
      { name: 'Eenhana', courtName: 'Eenhana Regional Magistrate Court', courtDivision: 'Regional Division' },
      { name: 'Helao Nafidi', courtName: 'Helao Nafidi / Oshikango Border Court', courtDivision: 'Border Court Division' },
      { name: 'Okongo', courtName: 'Okongo Magistrate Court', courtDivision: 'Subordinate Court Division' },
      { name: 'Omulonga', courtName: 'Omulonga Periodic Court', courtDivision: 'Periodic Court' },
    ],
  },
  {
    region: 'Omaheke',
    towns: [
      { name: 'Gobabis', courtName: 'Gobabis Regional Magistrate Court', courtDivision: 'Regional Division' },
      { name: 'Otjinene', courtName: 'Otjinene Magistrate Court', courtDivision: 'Subordinate Court Division' },
      { name: 'Witvlei', courtName: 'Witvlei Periodic Court', courtDivision: 'Periodic Court' },
      { name: 'Aminuis', courtName: 'Aminuis Periodic Court', courtDivision: 'Periodic Court' },
    ],
  },
  {
    region: 'Omusati',
    towns: [
      { name: 'Outapi', courtName: 'Outapi Regional Magistrate Court', courtDivision: 'Regional Division' },
      { name: 'Oshikuku', courtName: 'Oshikuku Magistrate Court', courtDivision: 'Subordinate Court Division' },
      { name: 'Ruacana', courtName: 'Ruacana Magistrate Court', courtDivision: 'Subordinate Court Division' },
      { name: 'Okahao', courtName: 'Okahao Magistrate Court', courtDivision: 'Subordinate Court Division' },
      { name: 'Tsandi', courtName: 'Tsandi Periodic Court', courtDivision: 'Periodic Court' },
      { name: 'Anamulenge', courtName: 'Anamulenge Periodic Court', courtDivision: 'Periodic Court' },
    ],
  },
  {
    region: 'Oshana',
    towns: [
      { name: 'Oshakati', courtName: 'High Court of Namibia (Northern Division)', courtDivision: 'High Court Northern Division' },
      { name: 'Ongwediva', courtName: 'Ongwediva Magistrate Court', courtDivision: 'Subordinate Court Division' },
      { name: 'Ondangwa', courtName: 'Ondangwa Regional Magistrate Court', courtDivision: 'Regional Division' },
      { name: 'Oshakati East', courtName: 'Oshakati East Periodic Court', courtDivision: 'Periodic Court' },
      { name: 'Oshakati West', courtName: 'Oshakati West Community Court', courtDivision: 'Community Station' },
    ],
  },
  {
    region: 'Oshikoto',
    towns: [
      { name: 'Omutiya', courtName: 'Omutiya Regional Magistrate Court', courtDivision: 'Regional Division' },
      { name: 'Tsumeb', courtName: 'Tsumeb Magistrate Court', courtDivision: 'Subordinate Court Division' },
      { name: 'Oniipa', courtName: 'Oniipa Periodic Court', courtDivision: 'Periodic Court' },
      { name: 'Guinas', courtName: 'Guinas Periodic Court', courtDivision: 'Periodic Court' },
    ],
  },
  {
    region: 'Otjozondjupa',
    towns: [
      { name: 'Otjiwarongo', courtName: 'Otjiwarongo Regional Magistrate Court', courtDivision: 'Regional Division' },
      { name: 'Grootfontein', courtName: 'Grootfontein Magistrate Court', courtDivision: 'Subordinate Court Division' },
      { name: 'Okahandja', courtName: 'Okahandja Magistrate Court', courtDivision: 'Subordinate Court Division' },
      { name: 'Otavi', courtName: 'Otavi Periodic Court', courtDivision: 'Periodic Court' },
      { name: 'Okakarara', courtName: 'Okakarara Magistrate Court', courtDivision: 'Subordinate Court Division' },
    ],
  },
  {
    region: 'Zambezi',
    towns: [
      { name: 'Katima Mulilo', courtName: 'Katima Mulilo Regional Magistrate Court', courtDivision: 'Regional Division' },
      { name: 'Kongola', courtName: 'Kongola Periodic Court', courtDivision: 'Periodic Court' },
      { name: 'Linyanti', courtName: 'Linyanti Periodic Court', courtDivision: 'Periodic Court' },
      { name: 'Sibbinda', courtName: 'Sibbinda Periodic Court', courtDivision: 'Periodic Court' },
    ],
  },
  {
    region: '//Kharas',
    towns: [
      { name: 'Keetmanshoop', courtName: 'Keetmanshoop Regional Magistrate Court', courtDivision: 'Regional Division' },
      { name: 'Lüderitz', courtName: 'Lüderitz Magistrate Court', courtDivision: 'Subordinate Court Division' },
      { name: 'Karasburg', courtName: 'Karasburg Magistrate Court', courtDivision: 'Subordinate Court Division' },
      { name: 'Berseba', courtName: 'Berseba Periodic Court', courtDivision: 'Periodic Court' },
      { name: 'Oranjemund', courtName: 'Oranjemund Magistrate Court', courtDivision: 'Subordinate Court Division' },
      { name: 'Noordoewer', courtName: 'Noordoewer Periodic Court', courtDivision: 'Periodic Court' },
      { name: 'Aus', courtName: 'Aus Periodic Court', courtDivision: 'Periodic Court' },
    ],
  },
];

export function getTownsByRegion(regionName: string): TownInfo[] {
  const reg = NAMIBIA_REGIONS.find((r) => r.region.toLowerCase() === regionName.toLowerCase());
  return reg ? reg.towns : [];
}

export function getAllRegions(): string[] {
  return NAMIBIA_REGIONS.map((r) => r.region);
}

export const SUPERIOR_COURTS = [
  'Supreme Court of Namibia (Windhoek)',
  'High Court of Namibia - Main Division (Windhoek)',
  'High Court of Namibia - Northern Local Division (Oshakati)',
  'Labour Court of Namibia (Windhoek)',
  'Electoral Court of Namibia (Windhoek)',
];
