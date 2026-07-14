/**
 * Product categories — mirrors the ENUM in ezone-server/config/database.js's
 * `products` table exactly. Labels are looked up via useLanguage() at the
 * call site (see getProductCategoryOptions), not hardcoded here, so they
 * stay bilingual.
 */
export const PRODUCT_CATEGORIES = [
  'REDUCER', 'CYLINDER', 'CONTROLLER', 'ECU', 'INJECTOR_RAIL', 'FILLING_VALVE',
  'MULTIVALVE', 'PRESSURE_SENSOR', 'FILTER', 'OTHER',
];

const CATEGORY_LABEL_KEY = {
  REDUCER: 'categoryReducer',
  CYLINDER: 'categoryCylinder',
  CONTROLLER: 'controller',
  ECU: 'categoryEcu',
  INJECTOR_RAIL: 'categoryInjectorRail',
  FILLING_VALVE: 'categoryFillingValve',
  MULTIVALVE: 'categoryMultivalve',
  PRESSURE_SENSOR: 'categoryPressureSensor',
  FILTER: 'categoryFilter',
  OTHER: 'categoryOther',
};

export const getProductCategoryLabel = (t, category) => t(CATEGORY_LABEL_KEY[category] || 'categoryOther');

export const getProductCategoryOptions = (t) =>
  PRODUCT_CATEGORIES.map((c) => ({ value: c, label: getProductCategoryLabel(t, c) }));
