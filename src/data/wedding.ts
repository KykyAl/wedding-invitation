/**
 * Single source of truth for the invitation content.
 * Swap couple, date, venue or media here — components never hardcode wedding data.
 *
 * TEMPLATE: every value below is an EXAMPLE placeholder ("Nama …", "Jl. Contoh …",
 * "1234567890"). Replace them with the real details before sharing the link.
 */
export const weddingData = {
  groom: {
    /** Short name — shown large on the cover, card, hero and closing. Keep it short. */
    nickname: "Pria",
    fullName: "Nama Lengkap Pengantin Pria",
    order: "Putra pertama dari",
    parents: "Bapak Nama Ayah & Ibu Nama Ibu",
    instagram: "username_pria",
    photo: "/assets/couple/groom.webp",
  },

  bride: {
    nickname: "Wanita",
    fullName: "Nama Lengkap Pengantin Wanita",
    order: "Putri kedua dari",
    parents: "Bapak Nama Ayah & Ibu Nama Ibu",
    instagram: "username_wanita",
    photo: "/assets/couple/bride.webp",
  },

  date: "12 Juni 2027",
  /** Machine-readable start of the first event (used by countdown & <time>). */
  dateTime: "2027-06-12T08:00:00+07:00",

  hashtag: "#HashtagPernikahan",

  quote: {
    text: "Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu pasangan hidup dari jenismu sendiri.",
    source: "QS. Ar-Rum: 21",
  },

  events: [
    {
      type: "Akad Nikah",
      date: "12 Juni 2027",
      day: "Sabtu",
      time: "08:00 WIB",
      venue: "Nama Venue",
      address: "Jl. Contoh No. 123, Kecamatan Contoh, Kota Contoh, Provinsi",
      start: "2027-06-12T08:00:00+07:00",
      end: "2027-06-12T10:00:00+07:00",
    },
    {
      type: "Resepsi",
      date: "12 Juni 2027",
      day: "Sabtu",
      time: "11:00 WIB",
      venue: "Nama Venue",
      address: "Jl. Contoh No. 123, Kecamatan Contoh, Kota Contoh, Provinsi",
      start: "2027-06-12T11:00:00+07:00",
      end: "2027-06-12T14:00:00+07:00",
    },
  ],

  dressCode: {
    title: "Earth Tone",
    note: "Kami akan sangat senang bila Anda berkenan mengenakan nuansa krem, cokelat, atau hijau zaitun.",
    colors: ["#E9D9BC", "#B8955A", "#6B5641", "#56603F"],
  },

  venue: {
    name: "Nama Venue",
    address: "Jl. Contoh No. 123, Kecamatan Contoh, Kota Contoh, Provinsi",
    /** Replace the query with the venue name, or paste the venue's Google Maps share link. */
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Indonesia",
    embedUrl: "https://www.google.com/maps?q=Indonesia&output=embed",
    notes: [
      "Contoh catatan: informasi cuaca atau pakaian yang disarankan.",
      "Contoh catatan: lokasi area parkir untuk tamu.",
      "Contoh catatan: estimasi waktu perjalanan dari pusat kota.",
    ],
  },

  story: [
    {
      year: "2019",
      title: "We Met",
      description: "Contoh cerita: tuliskan bagaimana kalian pertama kali bertemu.",
    },
    {
      year: "2021",
      title: "Our First Journey",
      description: "Contoh cerita: momen penting saat kalian mulai saling mengenal.",
    },
    {
      year: "2024",
      title: "We Decided Forever",
      description: "Contoh cerita: kisah lamaran atau saat memutuskan untuk melangkah bersama.",
    },
    {
      year: "2027",
      title: "The Beginning of Our Forever",
      description: "Hari di mana dua perjalanan menjadi satu cerita.",
    },
  ],

  gallery: [
    "/assets/gallery/gallery-01.webp",
    "/assets/gallery/gallery-02.webp",
    "/assets/gallery/gallery-03.webp",
    "/assets/gallery/gallery-04.webp",
    "/assets/gallery/gallery-05.webp",
    "/assets/gallery/gallery-06.webp",
  ],

  gift: {
    intro:
      "Doa restu Anda merupakan karunia yang sangat berarti bagi kami. Namun jika Anda ingin memberikan tanda kasih, kami menyediakan amplop digital dan alamat pengiriman kado.",
    accounts: [
      { bank: "Nama Bank", number: "1234567890", holder: "Nama Pemilik Rekening" },
      { bank: "Nama Bank", number: "0987654321", holder: "Nama Pemilik Rekening" },
      { bank: "E-Wallet", number: "081200000000", holder: "Nama Pemilik Akun" },
    ],
    address: {
      recipient: "Nama Penerima",
      phone: "081200000000",
      full: "Jl. Contoh No. 45, Kelurahan Contoh, Kecamatan Contoh, Kota Contoh, Provinsi 12345",
    },
  },

  rsvp: {
    deadline: "1 Juni 2027",
    maxGuests: 4,
    defaultName: "Nama Tamu",
  },

  /** Shown in the wishes wall before guests add their own. */
  wishes: [
    { name: "Contoh Tamu 1", attendance: "attend", message: "Contoh ucapan: selamat menempuh hidup baru, semoga menjadi keluarga yang sakinah, mawaddah, warahmah." },
    { name: "Contoh Tamu 2", attendance: "attend", message: "Contoh ucapan: barakallahu lakuma wa baraka alaikuma wa jama'a bainakuma fii khair." },
    { name: "Contoh Tamu 3", attendance: "absent", message: "Contoh ucapan: mohon maaf belum bisa hadir, doa terbaik untuk kalian berdua." },
  ],

  closing: {
    message:
      "Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.",
    signature: "Kami yang berbahagia",
    families: "Keluarga Besar Bapak Nama Ayah Pria & Keluarga Besar Bapak Nama Ayah Wanita",
  },

  music: {
    url: "/assets/music/wedding-cinematic.mp3",
    enabled: true,
  },

  /** Shown in the footer of the closing scene. */
  credits: {
    label: "di buat oleh",
    name: "KY",
    url: "https://www.instagram.com/kikyalfatahhillah?stkn=cmJwZjN2ZzZncXcw",
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

  mapsUrl: "https://www.google.com/maps/search/?api=1&query=Indonesia",
};

export type WeddingData = typeof weddingData;
export type WeddingEvent = WeddingData["events"][number];
export type Attendance = "attend" | "absent";
