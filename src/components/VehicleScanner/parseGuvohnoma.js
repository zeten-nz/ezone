export function parseFrontSide(text) {
  const plateMatch = text.match(/1[.\s]+([A-Z0-9]{6,10})/i);
  const modelLine = text.match(/2[.\s]+(.+)/i);
  const ownerMatch = text.match(/4[.\s]+(.+)/i);

  const modelText = modelLine?.[1]?.trim() || '';
  const brandWord = modelText.split(/[\s/]+/)[0];

  return {
    vehicle_plate_number: plateMatch?.[1]?.trim() || '',
    vehicle_brand: brandWord || '',
    vehicle_model: modelText || '',
    owner_full_name: ownerMatch?.[1]?.trim() || '',
  };
}

export function parseBackSide(text) {
  const yearMatch = text.match(/9[.\s]+(\d{4})/);
  const vinMatch = text.match(/11[.\s]+([A-Z0-9]{10,30})/i);
  const powerMatch = text.match(/15[.\s]+(\d+)/);

  return {
    vehicle_production_year: yearMatch?.[1] || '',
    vehicle_vin: vinMatch?.[1]?.trim() || '',
    vehicle_engine_power: powerMatch?.[1] || '',
  };
}
