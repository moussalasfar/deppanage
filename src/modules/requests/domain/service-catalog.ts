export const serviceCategories = [
  { id: "battery", label: "Batterie", icon: "battery" },
  { id: "tire", label: "Pneu", icon: "tire" },
  { id: "towing", label: "Remorquage", icon: "towing" },
  { id: "other", label: "Autre panne", icon: "other" },
] as const;

export type ServiceCategory = (typeof serviceCategories)[number];
export type ServiceCategoryId = ServiceCategory["id"];

export function isServiceCategoryId(value: string): value is ServiceCategoryId {
  return serviceCategories.some((service) => service.id === value);
}
