// Image / placeholder slot. When an asset path is given it renders the image
// contained within the frame (matching the prototype's <image-slot> look);
// otherwise it shows the striped placeholder with a label.

export default function Placeholder({
  label,
  image,
  contain = true,
}: {
  label?: string;
  image?: string | null;
  contain?: boolean;
}) {
  if (image) {
    const src = image.startsWith("/") || image.startsWith("http") ? image : `/${image}`;
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={label || ""}
        style={{
          width: "100%",
          height: "100%",
          objectFit: contain ? "contain" : "cover",
          padding: contain ? "12%" : 0,
          position: "absolute",
          inset: 0,
          background: "var(--paper)",
        }}
      />
    );
  }
  return (
    <>
      <div className="ph-stripes"></div>
      <div className="ph-label">{label}</div>
    </>
  );
}
