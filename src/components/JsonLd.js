// Safely embeds a JSON-LD structured-data object as a <script> tag.
// Escaping "<" prevents the payload from ever being able to close the
// surrounding <script> tag early.
export default function JsonLd({ data }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
