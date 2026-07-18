export const gigThumbnails = [
  "/assets/card-remotiva-1.png",
  "/assets/card-remotiva-2.png",
  "/assets/card-remotiva-3.png",
  "/assets/card-remotiva-4.png",
  "/assets/card-remotiva-5.png",
  "/assets/card-remotiva-6.png",
  "/assets/card-remotiva-7.png",
]

export function getGigThumbnail(service, index = 0) {
  const title = `${service?.title || ""} ${service?.category || ""}`.toLowerCase()

  if (title.includes("logo") || title.includes("design") || title.includes("desain") || title.includes("brand")) {
    return "/assets/card-remotiva-1.png"
  }

  if (title.includes("website") || title.includes("programming") || title.includes("pemrograman") || title.includes("web development")) {
    return "/assets/card-remotiva-2.png"
  }

  if (title.includes("ai") || title.includes("kreator") || title.includes("artificial")) {
    return "/assets/card-remotiva-3.png"
  }

  if (title.includes("animasi") || title.includes("animation") || title.includes("motion")) {
    return "/assets/card-remotiva-4.png"
  }

  if (title.includes("video") || title.includes("editing") || title.includes("editing")) {
    return "/assets/card-remotiva-5.png"
  }

  if (title.includes("marketing") || title.includes("pemasaran") || title.includes("seo") || title.includes("digital")) {
    return "/assets/card-remotiva-6.png"
  }

  if (title.includes("writing") || title.includes("penulisan") || title.includes("copywriting") || title.includes("content")) {
    return "/assets/card-remotiva-7.png"
  }

  return gigThumbnails[index % gigThumbnails.length]
}

export const fallbackThumbnail = "/assets/card-remotiva-1.png"
