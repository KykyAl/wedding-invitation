/**
 * Single source of truth for the invitation content.
 * Swap couple, date, venue or media here — components never hardcode wedding data.
 *
 * NOTE: parents, bank accounts, phone numbers and the gift address below are
 * SAMPLE values — replace them with the real ones before sharing the link.
 */
export const weddingData = {
  groom: {
    nickname: "Tony",
    fullName: "Tony Al Fatahhillah",
    order: "Putra pertama dari",
    parents: "Bapak Ahmad Fauzi & Ibu Siti Aminah",
    instagram: "tony.alfatahhillah",
    photo: "/assets/couple/groom.webp",
  },

  bride: {
    nickname: "Aulia",
    fullName: "Aulia Rahma",
    order: "Putri kedua dari",
    parents: "Bapak Hendra Wijaya & Ibu Dewi Lestari",
    instagram: "aulia.rahma",
    photo: "/assets/couple/bride.webp",
  },

  date: "11 November 2026",
  /** Machine-readable start of the first event (used by countdown & <time>). */
  dateTime: "2026-11-11T08:00:00+07:00",

  hashtag: "#TonyAuliaForever",

  quote: {
    text: "Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu pasangan hidup dari jenismu sendiri.",
    source: "QS. Ar-Rum: 21",
  },

  events: [
    {
      type: "Akad Nikah",
      date: "11 November 2026",
      day: "Rabu",
      time: "08:00 WIB",
      venue: "Ranca Upas",
      address: "Jl. Raya Ciwidey – Patengan, Kabupaten Bandung, Jawa Barat",
      start: "2026-11-11T08:00:00+07:00",
      end: "2026-11-11T10:00:00+07:00",
    },
    {
      type: "Reception",
      date: "11 November 2026",
      day: "Rabu",
      time: "11:00 WIB",
      venue: "Ranca Upas",
      address: "Jl. Raya Ciwidey – Patengan, Kabupaten Bandung, Jawa Barat",
      start: "2026-11-11T11:00:00+07:00",
      end: "2026-11-11T14:00:00+07:00",
    },
  ],

  dressCode: {
    title: "Earth Tone",
    note: "Kami akan sangat senang bila Anda berkenan mengenakan nuansa krem, cokelat, atau hijau zaitun.",
    colors: ["#E9D9BC", "#B8955A", "#6B5641", "#56603F"],
  },

  venue: {
    name: "Ranca Upas",
    address: "Jl. Raya Ciwidey – Patengan, Kabupaten Bandung, Jawa Barat",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Ranca+Upas+Bandung",
    embedUrl: "https://www.google.com/maps?q=Ranca+Upas+Ciwidey+Bandung&output=embed",
    notes: [
      "Ranca Upas berada di ketinggian ±1.700 mdpl — udara pagi cukup dingin, bawalah jaket.",
      "Area parkir tersedia di pintu masuk utama kawasan wisata.",
      "Perjalanan ±1,5–2 jam dari pusat Kota Bandung via Soreang – Ciwidey.",
    ],
  },

  story: [
    {
      year: "2019",
      title: "We Met",
      description: "Sebuah pertemuan sederhana menjadi awal dari perjalanan yang tidak pernah kami bayangkan.",
    },
    {
      year: "2021",
      title: "Our First Journey",
      description: "Kami mulai mengenal satu sama lain dan melewati banyak cerita bersama.",
    },
    {
      year: "2024",
      title: "We Decided Forever",
      description: "Kami menyadari bahwa perjalanan ini ingin kami lanjutkan bersama selamanya.",
    },
    {
      year: "2026",
      title: "The Beginning of Our Forever",
      description: "Hari di mana dua perjalanan menjadi satu cerita.",
    },
  ],

  gallery: [
    "/assets/gallery/Tony-aulia-01.webp",
    "/assets/gallery/Tony-aulia-02.webp",
    "/assets/gallery/Tony-aulia-03.webp",
    "/assets/gallery/Tony-aulia-04.webp",
    "/assets/gallery/Tony-aulia-05.webp",
    "/assets/gallery/Tony-aulia-06.webp",
  ],

  gift: {
    intro:
      "Doa restu Anda merupakan karunia yang sangat berarti bagi kami. Namun jika Anda ingin memberikan tanda kasih, kami menyediakan amplop digital dan alamat pengiriman kado.",
    accounts: [
      { bank: "BCA", number: "1234567890", holder: "Tony Al Fatahhillah" },
      { bank: "Mandiri", number: "1370012345678", holder: "Aulia Rahma" },
      { bank: "GoPay", number: "081234567890", holder: "Aulia Rahma" },
    ],
    address: {
      recipient: "Aulia Rahma",
      phone: "081234567890",
      full: "Jl. Cihampelas No. 123, Kel. Cipaganti, Kec. Coblong, Kota Bandung, Jawa Barat 40131",
    },
  },

  rsvp: {
    deadline: "1 November 2026",
    maxGuests: 4,
    defaultName: "Andi Pratama",
  },

  /** Shown in the wishes wall before guests add their own. */
  wishes: [
    { name: "Rina & Dimas", attendance: "attend", message: "Selamat menempuh hidup baru! Semoga menjadi keluarga yang sakinah, mawaddah, warahmah." },
    { name: "Keluarga Pak Budi", attendance: "attend", message: "Barakallahu lakuma wa baraka alaikuma wa jama'a bainakuma fii khair." },
    { name: "Sarah", attendance: "absent", message: "Maaf belum bisa hadir, doa terbaik untuk kalian berdua. Bahagia selalu!" },
  ],

  closing: {
    message:
      "Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.",
    signature: "Kami yang berbahagia",
    families: "Keluarga Besar Bapak Ahmad Fauzi & Keluarga Besar Bapak Hendra Wijaya",
  },

  music: {
    url: "/assets/music/wedding-cinematic.mp3",
    enabled: true,
  },

  /** Shown in the footer of the closing scene. */
  credits: {
    label: "Undangan digital oleh",
    name: "KykyAl",
    url: "https://github.com/KykyAl",
  },

  /**
   * WhatsApp message used by the guest-link tool (/share.html).
   * Placeholders: {nama} {link} {mempelai} {tanggal} {lokasi}
   */
  share: {
    message: `Assalamu'alaikum Warahmatullahi Wabarakatuh

Kepada Yth.
Bapak/Ibu/Saudara/i *{nama}*

Tanpa mengurangi rasa hormat, perkenankan kami mengundang Anda untuk hadir di acara pernikahan kami:

*{mempelai}*
🗓 {tanggal}
📍 {lokasi}

Info lengkap acara, lokasi, dan konfirmasi kehadiran:
{link}

Merupakan suatu kebahagiaan bagi kami apabila Anda berkenan hadir dan memberikan doa restu.

Wassalamu'alaikum Warahmatullahi Wabarakatuh
Kami yang berbahagia,
{mempelai}`,
  },

  meta: {
    description: "Together with our families, we invite you to celebrate the beginning of our forever.",
    ogImage: "/assets/og/wedding-preview.jpg",
  },

  mapsUrl: "https://www.google.com/maps/search/?api=1&query=Ranca+Upas+Bandung",
};

export type WeddingData = typeof weddingData;
export type WeddingEvent = WeddingData["events"][number];
export type Attendance = "attend" | "absent";
