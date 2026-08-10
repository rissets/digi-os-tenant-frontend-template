export type MediaAsset = {
  id: string;
  url: string;
  content_type?: string;
  original_name?: string;
  title?: string;
  description?: string;
  alt_text?: string;
  category?: string;
};

export type BrandConfig = {
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  surface_color: string;
  text_color: string;
  muted_color: string;
  navbar_background?: string;
  navbar_text_color?: string;
  footer_background?: string;
  footer_text_color?: string;
  heading_font?: string;
  body_font?: string;
  border_radius?: number;
  content_width?: number;
  assets?: { logo?: MediaAsset | null; dark_logo?: MediaAsset | null; favicon?: MediaAsset | null; default_social_image?: MediaAsset | null };
};

export type SiteSettings = {
  site_name: string;
  tagline: string;
  description: string;
  legal_name?: string;
  organization_type?: string;
  registration_number?: string;
  default_locale: string;
  available_locales: string[];
  contact_email?: string;
  support_email?: string;
  sales_email?: string;
  contact_phone?: string;
  whatsapp_number?: string;
  address?: string;
  business_hours?: string;
  contact_cta?: { label: string; url: string };
  map?: { provider: string; latitude: string; longitude: string; zoom: number; place_id?: string };
  timezone?: string;
};

export type MenuItem = {
  id: string;
  parent_id?: string | null;
  label: string;
  description?: string;
  url: string;
  page_slug?: string | null;
  target?: string;
  rel?: string;
  show_on_desktop?: boolean;
  show_on_mobile?: boolean;
  position?: number;
  icon?: string;
};
export type Menu = { key: string; label: string; items: MenuItem[] };
export type FooterColumn = { id: string; title: string; position: number; links: Array<{ label: string; url: string; target?: string; rel?: string }> };
export type FooterConfig = {
  heading: string;
  description: string;
  copyright: string;
  layout?: string;
  newsletter?: { enabled: boolean; heading: string; description: string; form_key: string };
  columns: FooterColumn[];
  social_links?: Array<{ platform: string; label?: string; url: string }>;
  visibility?: { social_links?: boolean; contact?: boolean; map_link?: boolean };
};

export type SiteLocation = {
  key: string;
  type: string;
  name: string;
  address: string;
  phone?: string;
  email?: string;
  business_hours?: string;
  coordinates: { latitude: string; longitude: string; zoom: number; place_id?: string };
  directions_label?: string;
  image?: MediaAsset | null;
  is_primary?: boolean;
  position?: number;
};

export type BlockItem = {
  id: string;
  title?: string;
  body?: string;
  label?: string;
  value?: string;
  caption?: string;
  icon?: string;
  image?: MediaAsset | null;
  url?: string;
  open_new_tab?: boolean;
};
export type BlockContent = {
  id: string;
  anchor_id?: string;
  eyebrow?: string;
  heading?: string;
  body?: string;
  button_label?: string;
  button_url?: string;
  secondary_button_label?: string;
  secondary_button_url?: string;
  caption?: string;
  image_asset_id?: string | null;
  image?: MediaAsset | null;
  video_url?: string;
  theme?: string;
  layout?: string;
  container_width?: string;
  vertical_spacing?: string;
  background_color?: string;
  text_color?: string;
  animation?: string;
  item_limit?: number;
  items?: BlockItem[];
};
export type ContentBlock = { type: string; schema_version: number; content: BlockContent };
export type CmsPage = {
  slug: string;
  page_type: string;
  title: string;
  navigation_title?: string;
  excerpt?: string;
  seo?: { description?: string; keywords?: string[]; robots?: string };
  social_image?: MediaAsset | null;
  template_key?: string;
  is_homepage?: boolean;
  theme_override?: string;
  header_variant?: string;
  footer_variant?: string;
  blocks: ContentBlock[];
  published_at?: string;
};

export type SiteConfig = { contract_version: string; locale: string; settings: SiteSettings; branding: BrandConfig; menus: Menu[]; footer: FooterConfig; locations?: SiteLocation[] };
export type SiteBundle = { site: SiteConfig; homepage: CmsPage | null; collections: Record<string, CollectionItem[]> };
export type CollectionResponse<T> = { count: number; next?: string | null; previous?: string | null; results: T[] };
export type CollectionItem = {
  slug: string;
  title: string;
  name?: string;
  excerpt?: string;
  summary?: string;
  description?: string;
  body?: string;
  cover?: MediaAsset | null;
  image?: MediaAsset | null;
  featured_image?: MediaAsset | null;
  status?: string;
  published_at?: string;
  sort_order?: number;
  metadata?: Record<string, unknown>;
  extra?: Record<string, unknown>;
  [key: string]: unknown;
};
export type ActiveChannel = {
  enabled: boolean;
  channel?: "live_chat" | "whatsapp" | string;
  show_on_all_pages?: boolean;
  cta_label?: string;
  offline_message?: string;
  live_chat?: { name: string; greeting: string; primary_color: string; position: string; embed_url: string; embed_html?: string };
  whatsapp?: { number?: string; url?: string; cta_label?: string };
};

export type ContactFormSchema = {
  key: string;
  title: string;
  description: string;
  success_message: string;
  fields: Array<{ key: string; type: string; label: string; required: boolean; options: string[] }>;
};

export type SearchResult = { type: string; slug: string; title: string; excerpt?: string; url: string };
export type SearchResponse = { query: string; locale: string; count: number; results: SearchResult[] };
export type SitemapRoute = { path: string; slug: string; type: string; updated_at?: string; published_at?: string; indexable: boolean };
export type SitemapResponse = { generated_at: string; routes: SitemapRoute[] };
export type RedirectResponse = { source_path: string; target_path: string; status_code: number; match_type: string; preserve_query_string: boolean };
export type PageResources = {
  blog?: CollectionItem[];
  faq?: CollectionItem[];
  products?: CollectionItem[];
  projects?: CollectionItem[];
  portfolio?: CollectionItem[];
  careers?: CollectionItem[];
  legal?: CollectionItem[];
  galleries?: CollectionItem[];
  form?: ContactFormSchema | null;
};
