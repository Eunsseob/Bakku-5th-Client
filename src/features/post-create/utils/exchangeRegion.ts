const provinceNames: Record<string, string> = {
  서울: '서울특별시',
  부산: '부산광역시',
  대구: '대구광역시',
  인천: '인천광역시',
  광주: '광주광역시',
  대전: '대전광역시',
  울산: '울산광역시',
  세종: '세종특별자치시',
  경기: '경기도',
  강원: '강원특별자치도',
  충북: '충청북도',
  충남: '충청남도',
  전북: '전북특별자치도',
  전남: '전라남도',
  경북: '경상북도',
  경남: '경상남도',
  제주: '제주특별자치도',
};

const validProvinces = new Set([...Object.values(provinceNames), '강원도', '전라북도']);

export function getExchangeRegion(address: string) {
  const [first, ...parts] = address.trim().split(/\s+/);
  const province = provinceNames[first] ?? first;
  if (!validProvinces.has(province)) return '';

  const districts = [];
  for (const part of parts) {
    if (!/[시군구읍면동리]$/.test(part) || districts.length === 3) break;
    districts.push(part);
  }
  return districts.length ? [province, ...districts].join(' ') : '';
}
