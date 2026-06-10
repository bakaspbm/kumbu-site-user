
export type ProductMeta = Record<string, string | number | boolean | null>;

export interface GeneralProductPublishState {
  title: string;
  priceLabel: string;
  province: string;
  municipality: string;
  description: string;
  attributes: Record<string, string>;
}

export const defaultGeneralProductPublishState = (): GeneralProductPublishState => ({
  title: "",
  priceLabel: "",
  province: "Luanda",
  municipality: "",
  description: "",
  attributes: {},
});
