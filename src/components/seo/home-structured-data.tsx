import { getSeoRoute } from "@/config/seo-routes";
import { getSiteUrl } from "@/config/site";

export function HomeStructuredData() {
  const home = getSeoRoute("/");
  const url = getSiteUrl().toString();
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@id": `${url}#website`,
        "@type": "WebSite",
        description: home.description,
        inLanguage: "en",
        name: "CompressByURL",
        url,
      },
      {
        "@id": `${url}#software-application`,
        "@type": "SoftwareApplication",
        applicationCategory: "MultimediaApplication",
        description: home.description,
        featureList: [
          "Browser-based image compression",
          "JPEG, PNG, WebP and static AVIF support",
          "Direct image URL import",
          "Single-webpage image scanning",
          "Target-size compression",
        ],
        name: "CompressByURL",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        operatingSystem: "Any operating system with a supported web browser",
        url,
      },
    ],
  };

  return (
    <script
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
      }}
      type="application/ld+json"
    />
  );
}
