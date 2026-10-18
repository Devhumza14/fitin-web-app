export const jsonLdString = (data: object) => JSON.stringify(data).replace(/</g, '\\u003c')

export const JsonLd = ({ data }: { data: object }) => (
  <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(data) }} />
)
