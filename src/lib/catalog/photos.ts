import type { ImageView } from "@/lib/images";

/**
 * Product photography, licensed from Unsplash (https://unsplash.com/license).
 * Per the Unsplash API guidelines, images are served from Unsplash's CDN (hotlinked, never re-hosted)
 * and every photo carries its photographer credit. Crops are generated on the fly by the CDN:
 * square, centred on `fp` (focal point x, y, zoom) or on the most detailed region when `fp` is absent.
 * Curated by hand: real, unbranded products that match each listing. Views that don't exist for a
 * colourway are simply absent, and the UI shows only the views that are there.
 */
export type ProductPhoto = {
  id: string;
  /** Unsplash raw URL (keeps its ixid tracking parameter) */
  src: string;
  /** Dominant colour, shown while the image loads */
  color: string;
  by: string;
  profile: string;
  page: string;
  fp?: readonly [x: number, y: number, zoom: number];
};

const p_YDZPdqv3FcA: ProductPhoto = { id: "YDZPdqv3FcA", src: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?ixid=M3wxMDg3NzYwfDB8MXxzZWFyY2h8Mnx8b3Zlci1lYXIlMjBoZWFkcGhvbmVzJTIwcHJvZHVjdHxlbnwxfHx8fDE3OTA3MjIwNjB8MA&ixlib=rb-4.1.0", color: "#f3f3f3", by: "Tomasz Gaw\u0142owski", profile: "https://unsplash.com/@gawlowski?utm_source=ayiin&utm_medium=referral", page: "https://unsplash.com/photos/black-wireless-headphones-between-apple-keyboard-and-apple-magic-mouse-on-white-surface-YDZPdqv3FcA?utm_source=ayiin&utm_medium=referral", fp: [0.45, 0.5, 1] };
const p_JRK8tsVv3y0: ProductPhoto = { id: "JRK8tsVv3y0", src: "https://images.unsplash.com/photo-1655804439989-24758d6e96b8?ixid=M3wxMDg3NzYwfDB8MXxzZWFyY2h8Mjh8fHdpcmVsZXNzJTIwZWFyYnVkcyUyMGNoYXJnaW5nJTIwY2FzZXxlbnwxfHx8fDE3OTA3MjIwNjN8MA&ixlib=rb-4.1.0", color: "#c0c0d9", by: "Amanz", profile: "https://unsplash.com/@amanz?utm_source=ayiin&utm_medium=referral", page: "https://unsplash.com/photos/a-black-and-white-object-JRK8tsVv3y0?utm_source=ayiin&utm_medium=referral" };
const p_gbG65gRAGx4: ProductPhoto = { id: "gbG65gRAGx4", src: "https://images.unsplash.com/photo-1582978571763-2d039e56f0c3?ixid=M3wxMDg3NzYwfDB8MXxzZWFyY2h8M3x8cG9ydGFibGUlMjBibHVldG9vdGglMjBzcGVha2VyJTIwcHJvZHVjdHxlbnwxfHx8fDE3OTA3MjIwNjV8MA&ixlib=rb-4.1.0", color: "#594026", by: "Nicolas J Leclercq", profile: "https://unsplash.com/@nicolasjleclercq?utm_source=ayiin&utm_medium=referral", page: "https://unsplash.com/photos/white-and-silver-portable-speaker-on-brown-wooden-table-gbG65gRAGx4?utm_source=ayiin&utm_medium=referral" };
const p_ZWfOEaNfelY: ProductPhoto = { id: "ZWfOEaNfelY", src: "https://images.unsplash.com/photo-1645021785273-140b720bb63f?ixid=M3wxMDg3NzYwfDB8MXxzZWFyY2h8Mjh8fGxhcHRvcCUyMG9uJTIwZGVzayUyMG1pbmltYWx8ZW58MXx8fHwxNzkwNzIyMDY5fDA&ixlib=rb-4.1.0", color: "#c0c0c0", by: "Clay Banks", profile: "https://unsplash.com/@claybanks?utm_source=ayiin&utm_medium=referral", page: "https://unsplash.com/photos/a-laptop-computer-sitting-on-top-of-a-wooden-table-ZWfOEaNfelY?utm_source=ayiin&utm_medium=referral", fp: [0.5, 0.72, 1] };
const p_s7IIk_2dA7g: ProductPhoto = { id: "s7IIk_2dA7g", src: "https://images.unsplash.com/photo-1587902673915-631e5ba4488f?ixid=M3wxMDg3NzYwfDB8MXxzZWFyY2h8MjN8fGxhcHRvcCUyMG9uJTIwZGVzayUyMG1pbmltYWx8ZW58MXx8fHwxNzkwNzIyMDY5fDA&ixlib=rb-4.1.0", color: "#8c8c73", by: "Clay Banks", profile: "https://unsplash.com/@claybanks?utm_source=ayiin&utm_medium=referral", page: "https://unsplash.com/photos/macbook-pro-on-brown-wooden-table-s7IIk_2dA7g?utm_source=ayiin&utm_medium=referral" };
const p_cVUPic1cbd4: ProductPhoto = { id: "cVUPic1cbd4", src: "https://images.unsplash.com/photo-1589578228447-e1a4e481c6c8?ixid=M3wxMDg3NzYwfDB8MXxzZWFyY2h8Mnx8bWluaW1hbCUyMHdpcmVsZXNzJTIwa2V5Ym9hcmR8ZW58MXx8fHwxNzkwNzIyMDcxfDA&ixlib=rb-4.1.0", color: "#d9d9d9", by: "Martin Garrido", profile: "https://unsplash.com/@martingarrido?utm_source=ayiin&utm_medium=referral", page: "https://unsplash.com/photos/black-computer-keyboard-on-white-table-cVUPic1cbd4?utm_source=ayiin&utm_medium=referral", fp: [0.49, 0.48, 1] };
const p_gVpXbCGG6jI: ProductPhoto = { id: "gVpXbCGG6jI", src: "https://images.unsplash.com/photo-1639413665566-2f75adf7b7ca?ixid=M3wxMDg3NzYwfDB8MXxzZWFyY2h8Mjd8fGNvbXB1dGVyJTIwbW9uaXRvciUyMGRlc2slMjBzZXR1cCUyMG1pbmltYWx8ZW58MXx8fHwxNzkwNzIyMDc0fDA&ixlib=rb-4.1.0", color: "#d9d9d9", by: "Teddy GR", profile: "https://unsplash.com/@teddygr?utm_source=ayiin&utm_medium=referral", page: "https://unsplash.com/photos/a-computer-monitor-sitting-on-top-of-a-white-desk-gVpXbCGG6jI?utm_source=ayiin&utm_medium=referral", fp: [0.48, 0.5, 1] };
const p_uReyg5eZSbQ: ProductPhoto = { id: "uReyg5eZSbQ", src: "https://images.unsplash.com/photo-1693822845595-862bacc31cf9?ixid=M3wxMDg3NzYwfDB8MXxzZWFyY2h8MTR8fHNtYXJ0cGhvbmUlMjBwcm9kdWN0JTIwbWluaW1hbHxlbnwxfHx8fDE3OTA3MjIwNzd8MA&ixlib=rb-4.1.0", color: "#f3f3f3", by: "Thujey Ngetup", profile: "https://unsplash.com/@thujey?utm_source=ayiin&utm_medium=referral", page: "https://unsplash.com/photos/a-black-and-green-cell-phone-on-a-white-surface-uReyg5eZSbQ?utm_source=ayiin&utm_medium=referral" };
const p_ulh3_dLSXjI: ProductPhoto = { id: "ulh3-dLSXjI", src: "https://images.unsplash.com/photo-1667312939978-64cf31718a6e?ixid=M3wxMDg3NzYwfDB8MXxzZWFyY2h8MXx8dGFibGUlMjBsYW1wJTIwaW50ZXJpb3J8ZW58MXx8fHwxNzkwNzIyMDgwfDA&ixlib=rb-4.1.0", color: "#c0c0a6", by: "Karolina Grabowska", profile: "https://unsplash.com/@kaboompics?utm_source=ayiin&utm_medium=referral", page: "https://unsplash.com/photos/a-lamp-and-books-on-a-table-ulh3-dLSXjI?utm_source=ayiin&utm_medium=referral" };
const p_7mmmEkyk0aQ: ProductPhoto = { id: "7mmmEkyk0aQ", src: "https://images.unsplash.com/photo-1763279934323-edb3735f6a6e?ixid=M3wxMDg3NzYwfDB8MXxzZWFyY2h8M3x8Ym91Y2xlJTIwbG91bmdlJTIwY2hhaXJ8ZW58MXx8fHwxNzkwNzIyMDg0fDA&ixlib=rb-4.1.0", color: "#c0c0c0", by: "Alina Bondar", profile: "https://unsplash.com/@alinabondar_ph?utm_source=ayiin&utm_medium=referral", page: "https://unsplash.com/photos/a-light-colored-armchair-with-a-cushion-on-wooden-floor-7mmmEkyk0aQ?utm_source=ayiin&utm_medium=referral" };
const p_r0u8YuXfaho: ProductPhoto = { id: "r0u8YuXfaho", src: "https://images.unsplash.com/photo-1687191883740-869382375bd6?ixid=M3wxMDg3NzYwfDB8MXxzZWFyY2h8MjN8fGNlcmFtaWMlMjBidWQlMjB2YXNlc3xlbnwxfHx8fDE3OTA3MjIwODd8MA&ixlib=rb-4.1.0", color: "#c0c0c0", by: "Sixteen Miles Out", profile: "https://unsplash.com/@sixteenmilesout?utm_source=ayiin&utm_medium=referral", page: "https://unsplash.com/photos/three-white-vases-sitting-on-top-of-each-other-r0u8YuXfaho?utm_source=ayiin&utm_medium=referral" };
const p_Gm1JXx_PA1Q: ProductPhoto = { id: "Gm1JXx_PA1Q", src: "https://images.unsplash.com/photo-1687191886564-4df56dc1c7df?ixid=M3wxMDg3NzYwfDB8MXxzZWFyY2h8MTd8fGNlcmFtaWMlMjBidWQlMjB2YXNlc3xlbnwxfHx8fDE3OTA3MjIwODd8MA&ixlib=rb-4.1.0", color: "#c0c0c0", by: "Sixteen Miles Out", profile: "https://unsplash.com/@sixteenmilesout?utm_source=ayiin&utm_medium=referral", page: "https://unsplash.com/photos/three-white-vases-lined-up-in-a-row-Gm1JXx_PA1Q?utm_source=ayiin&utm_medium=referral" };
const p_aFvxASlms2A: ProductPhoto = { id: "aFvxASlms2A", src: "https://images.unsplash.com/photo-1687191883721-257d8cad5b54?ixid=M3wxMDg3NzYwfDB8MXxzZWFyY2h8NHx8Y2VyYW1pYyUyMGJ1ZCUyMHZhc2VzfGVufDF8fHx8MTc5MDcyMjA4N3ww&ixlib=rb-4.1.0", color: "#c0c0c0", by: "Sixteen Miles Out", profile: "https://unsplash.com/@sixteenmilesout?utm_source=ayiin&utm_medium=referral", page: "https://unsplash.com/photos/a-white-vase-sitting-on-top-of-a-white-table-aFvxASlms2A?utm_source=ayiin&utm_medium=referral" };
const p__cfd9px_GV8: ProductPhoto = { id: "-cfd9px-GV8", src: "https://images.unsplash.com/photo-1677761821976-4a2b4ed29437?ixid=M3wxMDg3NzYwfDB8MXxzZWFyY2h8OXx8Y2VyYW1pYyUyMGJ1ZCUyMHZhc2VzfGVufDF8fHx8MTc5MDcyMjA4N3ww&ixlib=rb-4.1.0", color: "#c0a68c", by: "Tamara Harhai", profile: "https://unsplash.com/@toma_ha?utm_source=ayiin&utm_medium=referral", page: "https://unsplash.com/photos/a-couple-of-vases-sitting-on-top-of-a-table--cfd9px-GV8?utm_source=ayiin&utm_medium=referral" };
const p_tSkPbVkiCqY: ProductPhoto = { id: "tSkPbVkiCqY", src: "https://images.unsplash.com/photo-1677761640321-b80251be00ca?ixid=M3wxMDg3NzYwfDB8MXxzZWFyY2h8MXx8Y2VyYW1pYyUyMGJ1ZCUyMHZhc2VzfGVufDF8fHx8MTc5MDcyMjA4N3ww&ixlib=rb-4.1.0", color: "#d9c0a6", by: "Tamara Harhai", profile: "https://unsplash.com/@toma_ha?utm_source=ayiin&utm_medium=referral", page: "https://unsplash.com/photos/a-couple-of-vases-sitting-on-top-of-a-table-tSkPbVkiCqY?utm_source=ayiin&utm_medium=referral" };
const p_CUoyo6Pz0pU: ProductPhoto = { id: "CUoyo6Pz0pU", src: "https://images.unsplash.com/photo-1714228499605-367154d9bdb2?ixid=M3wxMDg3NzYwfDB8MXxzZWFyY2h8MTR8fGNhbmRsZSUyMGFtYmVyJTIwZ2xhc3MlMjBqYXJ8ZW58MXx8fHwxNzkwNzIyMDkxfDA&ixlib=rb-4.1.0", color: "#402626", by: "Natali Martynova", profile: "https://unsplash.com/@natamarty?utm_source=ayiin&utm_medium=referral", page: "https://unsplash.com/photos/a-lit-candle-sitting-on-top-of-a-table-CUoyo6Pz0pU?utm_source=ayiin&utm_medium=referral" };
const p_vnOVs44jsog: ProductPhoto = { id: "vnOVs44jsog", src: "https://images.unsplash.com/photo-1657790520920-3e6d94f9b81e?ixid=M3wxMDg3NzYwfDB8MXxzZWFyY2h8Mnx8b2xpdmUlMjB0cmVlJTIwdGVycmFjb3R0YSUyMHBvdHxlbnwxfHx8fDE3OTA3MjIwOTR8MA&ixlib=rb-4.1.0", color: "#d9d9d9", by: "norbert velescu", profile: "https://unsplash.com/@nvelescu?utm_source=ayiin&utm_medium=referral", page: "https://unsplash.com/photos/a-potted-plant-on-a-table-vnOVs44jsog?utm_source=ayiin&utm_medium=referral" };
const p_VnE7Bh6OMpA: ProductPhoto = { id: "VnE7Bh6OMpA", src: "https://images.unsplash.com/photo-1690700933084-bfa02d56d2ab?ixid=M3wxMDg3NzYwfDB8MXxzZWFyY2h8NXx8b2xpdmUlMjB0cmVlJTIwdGVycmFjb3R0YSUyMHBvdHxlbnwxfHx8fDE3OTA3MjIwOTR8MA&ixlib=rb-4.1.0", color: "#a68c8c", by: "Anita Austvika", profile: "https://unsplash.com/@anitaaustvika?utm_source=ayiin&utm_medium=referral", page: "https://unsplash.com/photos/a-potted-plant-sitting-next-to-a-wall-VnE7Bh6OMpA?utm_source=ayiin&utm_medium=referral" };
const p_RkCvkHgfiqc: ProductPhoto = { id: "RkCvkHgfiqc", src: "https://images.unsplash.com/photo-1570569962804-5377da5be035?ixid=M3wxMDg3NzYwfDB8MXxzZWFyY2h8MTV8fGdvb3NlbmVjayUyMGtldHRsZSUyMHBvdXIlMjBvdmVyfGVufDF8fHx8MTc5MDcyMjA5N3ww&ixlib=rb-4.1.0", color: "#d9d9d9", by: "Avery Evans", profile: "https://unsplash.com/@averye457?utm_source=ayiin&utm_medium=referral", page: "https://unsplash.com/photos/black-coffee-teapot-RkCvkHgfiqc?utm_source=ayiin&utm_medium=referral" };
const p_ABubc4ERUvU: ProductPhoto = { id: "ABubc4ERUvU", src: "https://images.unsplash.com/photo-1570570100030-a325c3404073?ixid=M3wxMDg3NzYwfDB8MXxzZWFyY2h8MTR8fGdvb3NlbmVjayUyMGtldHRsZSUyMHBvdXIlMjBvdmVyfGVufDF8fHx8MTc5MDcyMjA5N3ww&ixlib=rb-4.1.0", color: "#a6a6a6", by: "Avery Evans", profile: "https://unsplash.com/@averye457?utm_source=ayiin&utm_medium=referral", page: "https://unsplash.com/photos/clear-glass-container-ABubc4ERUvU?utm_source=ayiin&utm_medium=referral" };
const p_tVeVHHWCfHM: ProductPhoto = { id: "tVeVHHWCfHM", src: "https://images.unsplash.com/photo-1650940925927-f4a30c930a4d?ixid=M3wxMDg3NzYwfDB8MXxzZWFyY2h8MXx8Z29vc2VuZWNrJTIwa2V0dGxlJTIwcG91ciUyMG92ZXJ8ZW58MXx8fHwxNzkwNzIyMDk3fDA&ixlib=rb-4.1.0", color: "#f3f3f3", by: "Paul Esch-Laurent", profile: "https://unsplash.com/@pinjasaur?utm_source=ayiin&utm_medium=referral", page: "https://unsplash.com/photos/a-coffee-maker-on-a-table-tVeVHHWCfHM?utm_source=ayiin&utm_medium=referral", fp: [0.72, 0.5, 1] };
const p_vu0lyZYeseY: ProductPhoto = { id: "vu0lyZYeseY", src: "https://images.unsplash.com/photo-1572003414077-38770ebec0a4?ixid=M3wxMDg3NzYwfDB8MXxzZWFyY2h8N3x8c3RvbmV3YXJlJTIwbXVnc3xlbnwxfHx8fDE3OTA3MjIxMDB8MA&ixlib=rb-4.1.0", color: "#404040", by: "Tom Crew", profile: "https://unsplash.com/@tomcrewceramics?utm_source=ayiin&utm_medium=referral", page: "https://unsplash.com/photos/two-empty-white-metal-cups-vu0lyZYeseY?utm_source=ayiin&utm_medium=referral" };
const p_wizWrRZJXSg: ProductPhoto = { id: "wizWrRZJXSg", src: "https://images.unsplash.com/photo-1695245503558-5cdb37f49092?ixid=M3wxMDg3NzYwfDB8MXxzZWFyY2h8M3x8Y29mZmVlJTIwYmFnJTIwcGFja2FnaW5nfGVufDF8fHx8MTc5MDcyMjEwNHww&ixlib=rb-4.1.0", color: "#f3f3f3", by: "With Mahdy", profile: "https://unsplash.com/@withmahdy?utm_source=ayiin&utm_medium=referral", page: "https://unsplash.com/photos/a-brown-paper-bag-sitting-on-top-of-a-white-table-wizWrRZJXSg?utm_source=ayiin&utm_medium=referral" };
const p_VeW_kL0isfs: ProductPhoto = { id: "LxVxPA1LOVM", src: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?ixlib=rb-4.1.0", color: "#f4f4f3", by: "Imani Bahati", profile: "https://unsplash.com/@imani_bht?utm_source=ayiin&utm_medium=referral", page: "https://unsplash.com/photos/unpaired-gray-nike-running-shoe-LxVxPA1LOVM?utm_source=ayiin&utm_medium=referral" };
const p_d_BTL93LsGg: ProductPhoto = { id: "d-BTL93LsGg", src: "https://images.unsplash.com/photo-1594299447935-e5b840f54b9b?ixid=M3wxMDg3NzYwfDB8MXxzZWFyY2h8MjN8fGJhY2twYWNrJTIwcHJvZHVjdHxlbnwxfHx8fDE3OTA3MjIxMTJ8MA&ixlib=rb-4.1.0", color: "#d9d9d9", by: "I'M ZION", profile: "https://unsplash.com/@ziontech?utm_source=ayiin&utm_medium=referral", page: "https://unsplash.com/photos/black-backpack-on-white-box-d-BTL93LsGg?utm_source=ayiin&utm_medium=referral" };
const p_xfNeB1stZ_0: ProductPhoto = { id: "xfNeB1stZ_0", src: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?ixid=M3wxMDg3NzYwfDB8MXxzZWFyY2h8M3x8bWluaW1hbGlzdCUyMHdyaXN0d2F0Y2h8ZW58MXx8fHwxNzkwNzIyMTE2fDA&ixlib=rb-4.1.0", color: "#c0c0c0", by: "Jaelynn Castillo", profile: "https://unsplash.com/@jaelynnalexis?utm_source=ayiin&utm_medium=referral", page: "https://unsplash.com/photos/person-holding-analog-watch-xfNeB1stZ_0?utm_source=ayiin&utm_medium=referral" };
const p_ODhxNCO8XHY: ProductPhoto = { id: "ODhxNCO8XHY", src: "https://images.unsplash.com/photo-1587310311582-aa7610e90826?ixid=M3wxMDg3NzYwfDB8MXxzZWFyY2h8MTJ8fHN1bmdsYXNzZXMlMjBwcm9kdWN0fGVufDF8fHx8MTc5MDcyMjEyMHww&ixlib=rb-4.1.0", color: "#d9d9d9", by: "Anton Be", profile: "https://unsplash.com/@antonbe21?utm_source=ayiin&utm_medium=referral", page: "https://unsplash.com/photos/black-framed-sunglasses-on-white-table-ODhxNCO8XHY?utm_source=ayiin&utm_medium=referral" };
const p_dtOTQYmTEs0: ProductPhoto = { id: "dtOTQYmTEs0", src: "https://images.unsplash.com/photo-1577803645773-f96470509666?ixid=M3wxMDg3NzYwfDB8MXxzZWFyY2h8Mnx8c3VuZ2xhc3NlcyUyMHByb2R1Y3R8ZW58MXx8fHwxNzkwNzIyMTIwfDA&ixlib=rb-4.1.0", color: "#f3d9d9", by: "Sebastian Coman Travel", profile: "https://unsplash.com/@sebcomantravel?utm_source=ayiin&utm_medium=referral", page: "https://unsplash.com/photos/white-framed-brown-lens-sunglasses-dtOTQYmTEs0?utm_source=ayiin&utm_medium=referral", fp: [0.5, 0.55, 1] };
const p_Aej5gA11eHQ: ProductPhoto = { id: "Aej5gA11eHQ", src: "https://images.unsplash.com/photo-1605714312496-01e90cb509cc?ixid=M3wxMDg3NzYwfDB8MXxzZWFyY2h8Nnx8aW5zdWxhdGVkJTIwd2F0ZXIlMjBib3R0bGV8ZW58MXx8fHwxNzkwNzIyMTI0fDA&ixlib=rb-4.1.0", color: "#c0c0a6", by: "Vanesa Giaconi", profile: "https://unsplash.com/@vanesagiaconi?utm_source=ayiin&utm_medium=referral", page: "https://unsplash.com/photos/white-bottle-on-white-table-Aej5gA11eHQ?utm_source=ayiin&utm_medium=referral" };
const p_z7fI_BSHJRI: ProductPhoto = { id: "z7fI-BSHJRI", src: "https://images.unsplash.com/photo-1605714244517-5ddd3773de4d?ixid=M3wxMDg3NzYwfDB8MXxzZWFyY2h8MjR8fGluc3VsYXRlZCUyMHdhdGVyJTIwYm90dGxlfGVufDF8fHx8MTc5MDcyMjEyNHww&ixlib=rb-4.1.0", color: "#c0c0c0", by: "Vanesa Giaconi", profile: "https://unsplash.com/@vanesagiaconi?utm_source=ayiin&utm_medium=referral", page: "https://unsplash.com/photos/white-moth-orchids-in-white-ceramic-vase-z7fI-BSHJRI?utm_source=ayiin&utm_medium=referral" };
const p_WdJ4WnLxyDs: ProductPhoto = { id: "WdJ4WnLxyDs", src: "https://images.unsplash.com/photo-1576426863848-c21f53c60b19?ixid=M3wxMDg3NzYwfDB8MXxzZWFyY2h8MTR8fHNlcnVtJTIwZHJvcHBlciUyMGJvdHRsZXxlbnwxfHx8fDE3OTA3MjIxMjl8MA&ixlib=rb-4.1.0", color: "#f3f3f3", by: "Content Pixie", profile: "https://unsplash.com/@contentpixie?utm_source=ayiin&utm_medium=referral", page: "https://unsplash.com/photos/white-drop-bottle-on-white-surface-WdJ4WnLxyDs?utm_source=ayiin&utm_medium=referral", fp: [0.28, 0.55, 1.35] };
const p_b9KAwJRBXgw: ProductPhoto = { id: "b9KAwJRBXgw", src: "https://images.unsplash.com/photo-1608571424266-edeb9bbefdec?ixid=M3wxMDg3NzYwfDB8MXxzZWFyY2h8MjN8fHNlcnVtJTIwZHJvcHBlciUyMGJvdHRsZXxlbnwxfHx8fDE3OTA3MjIxMjl8MA&ixlib=rb-4.1.0", color: "#a6a6a6", by: "Kadarius Seegars", profile: "https://unsplash.com/@kseegars?utm_source=ayiin&utm_medium=referral", page: "https://unsplash.com/photos/brown-glass-bottle-on-white-table-b9KAwJRBXgw?utm_source=ayiin&utm_medium=referral" };
const p_GDSNp1RJyLE: ProductPhoto = { id: "GDSNp1RJyLE", src: "https://images.unsplash.com/photo-1608571424237-381e6b43a2a7?ixid=M3wxMDg3NzYwfDB8MXxzZWFyY2h8MTh8fHNlcnVtJTIwZHJvcHBlciUyMGJvdHRsZXxlbnwxfHx8fDE3OTA3MjIxMjl8MA&ixlib=rb-4.1.0", color: "#c0c0c0", by: "Kadarius Seegars", profile: "https://unsplash.com/@kseegars?utm_source=ayiin&utm_medium=referral", page: "https://unsplash.com/photos/clear-glass-bottle-with-orange-liquid-GDSNp1RJyLE?utm_source=ayiin&utm_medium=referral" };
const p_2c1orP6z2eo: ProductPhoto = { id: "2c1orP6z2eo", src: "https://images.unsplash.com/photo-1608571702600-5a5419d31475?ixid=M3wxMDg3NzYwfDB8MXxzZWFyY2h8MjJ8fHNlcnVtJTIwZHJvcHBlciUyMGJvdHRsZXxlbnwxfHx8fDE3OTA3MjIxMjl8MA&ixlib=rb-4.1.0", color: "#8c8c8c", by: "Kadarius Seegars", profile: "https://unsplash.com/@kseegars?utm_source=ayiin&utm_medium=referral", page: "https://unsplash.com/photos/clear-glass-bottle-with-brown-liquid-2c1orP6z2eo?utm_source=ayiin&utm_medium=referral" };
const p_7mfNpV5eJH0: ProductPhoto = { id: "7mfNpV5eJH0", src: "https://images.unsplash.com/photo-1688578735352-9a6f2ac3b70a?ixid=M3wxMDg3NzYwfDB8MXxzZWFyY2h8Mnx8ZXJnb25vbWljJTIwb2ZmaWNlJTIwY2hhaXJ8ZW58MXx8fHwxNzkwNzIyMTM2fDA&ixlib=rb-4.1.0", color: "#d9d9d9", by: "EFFYDESK", profile: "https://unsplash.com/@effydesk?utm_source=ayiin&utm_medium=referral", page: "https://unsplash.com/photos/a-gray-office-chair-sitting-next-to-a-wooden-table-7mfNpV5eJH0?utm_source=ayiin&utm_medium=referral", fp: [0.5, 0.42, 1] };
const p_TIOGOV5ZQzA: ProductPhoto = { id: "TIOGOV5ZQzA", src: "https://images.unsplash.com/photo-1688578735427-994ecdea3ea4?ixid=M3wxMDg3NzYwfDB8MXxzZWFyY2h8MXx8ZXJnb25vbWljJTIwb2ZmaWNlJTIwY2hhaXJ8ZW58MXx8fHwxNzkwNzIyMTM2fDA&ixlib=rb-4.1.0", color: "#d9d9d9", by: "EFFYDESK", profile: "https://unsplash.com/@effydesk?utm_source=ayiin&utm_medium=referral", page: "https://unsplash.com/photos/an-office-chair-sitting-on-top-of-a-wooden-desk-TIOGOV5ZQzA?utm_source=ayiin&utm_medium=referral", fp: [0.5, 0.4, 1] };
const p_8hQu_VuLY08: ProductPhoto = { id: "8hQu_VuLY08", src: "https://images.unsplash.com/photo-1688578735122-f37256f1b8b0?ixid=M3wxMDg3NzYwfDB8MXxzZWFyY2h8N3x8ZXJnb25vbWljJTIwb2ZmaWNlJTIwY2hhaXJ8ZW58MXx8fHwxNzkwNzIyMTM2fDA&ixlib=rb-4.1.0", color: "#d9d9d9", by: "EFFYDESK", profile: "https://unsplash.com/@effydesk?utm_source=ayiin&utm_medium=referral", page: "https://unsplash.com/photos/a-white-office-chair-sitting-on-top-of-a-wooden-desk-8hQu_VuLY08?utm_source=ayiin&utm_medium=referral" };
const p_ElELSfycRvw: ProductPhoto = { id: "ElELSfycRvw", src: "https://images.unsplash.com/photo-1688578735997-32626d2babd4?ixid=M3wxMDg3NzYwfDB8MXxzZWFyY2h8MTB8fGVyZ29ub21pYyUyMG9mZmljZSUyMGNoYWlyfGVufDF8fHx8MTc5MDcyMjEzNnww&ixlib=rb-4.1.0", color: "#d9d9d9", by: "EFFYDESK", profile: "https://unsplash.com/@effydesk?utm_source=ayiin&utm_medium=referral", page: "https://unsplash.com/photos/a-woman-sitting-in-an-office-chair-with-a-computer-on-her-desk-ElELSfycRvw?utm_source=ayiin&utm_medium=referral" };
const p_V29UWcALNko: ProductPhoto = { id: "V29UWcALNko", src: "https://images.unsplash.com/photo-1516409590654-e8d51fc2d25c?ixid=M3wxMDg3NzYwfDB8MXxzZWFyY2h8MXx8c3RhY2slMjBvZiUyMHdoaXRlJTIwcHJpbnRlciUyMHBhcGVyfGVufDF8fHx8MTc5MDcyMjU4OHww&ixlib=rb-4.1.0", color: "#f3f3f3", by: "ron dyar", profile: "https://unsplash.com/@prolabprints?utm_source=ayiin&utm_medium=referral", page: "https://unsplash.com/photos/stack-of-papers-V29UWcALNko?utm_source=ayiin&utm_medium=referral", fp: [0.5, 0.55, 1] };
const p_ou3l4V9DUNo: ProductPhoto = { id: "ou3l4V9DUNo", src: "https://images.unsplash.com/photo-1622100223492-9a839fba8672?ixid=M3wxMDg3NzYwfDB8MXxzZWFyY2h8M3x8c3RhY2slMjBvZiUyMHdoaXRlJTIwcHJpbnRlciUyMHBhcGVyfGVufDF8fHx8MTc5MDcyMjU4OHww&ixlib=rb-4.1.0", color: "#8c8c8c", by: "Thomas Kinto", profile: "https://unsplash.com/@thomaskinto?utm_source=ayiin&utm_medium=referral", page: "https://unsplash.com/photos/white-and-brown-book-page-ou3l4V9DUNo?utm_source=ayiin&utm_medium=referral" };
const p_1JSUX4iB0YE: ProductPhoto = { id: "1JSUX4iB0YE", src: "https://images.unsplash.com/photo-1623123096729-26b481292919?ixid=M3wxMDg3NzYwfDB8MXxzZWFyY2h8NHx8aGFuZGhlbGQlMjBzY2FubmVyJTIwd2FyZWhvdXNlJTIwcGFja2FnZXxlbnwxfHx8fDE3OTA3MjI1OTJ8MA&ixlib=rb-4.1.0", color: "#d9d9d9", by: "S O C I A L . C U T", profile: "https://unsplash.com/@socialcut?utm_source=ayiin&utm_medium=referral", page: "https://unsplash.com/photos/text-1JSUX4iB0YE?utm_source=ayiin&utm_medium=referral", fp: [0.72, 0.42, 1.4] };
const p_bYhDEWgqYLM: ProductPhoto = { id: "bYhDEWgqYLM", src: "https://images.unsplash.com/photo-1656543802898-41c8c46683a7?ixid=M3wxMDg3NzYwfDB8MXxzZWFyY2h8MXx8Y2FyZGJvYXJkJTIwc2hpcHBpbmclMjBib3hlc3xlbnwxfHx8fDE3OTA3MjIxNDZ8MA&ixlib=rb-4.1.0", color: "#f3f3f3", by: "Giorgio Trovato", profile: "https://unsplash.com/@giorgiotrovato?utm_source=ayiin&utm_medium=referral", page: "https://unsplash.com/photos/a-brown-box-with-a-white-background-bYhDEWgqYLM?utm_source=ayiin&utm_medium=referral" };
const p_8mCsyImZRGY: ProductPhoto = { id: "8mCsyImZRGY", src: "https://images.unsplash.com/photo-1577705998148-6da4f3963bc8?ixid=M3wxMDg3NzYwfDB8MXxzZWFyY2h8Mnx8Y2FyZGJvYXJkJTIwc2hpcHBpbmclMjBib3hlc3xlbnwxfHx8fDE3OTA3MjIxNDZ8MA&ixlib=rb-4.1.0", color: "#c0c0c0", by: "Brandable Box", profile: "https://unsplash.com/@brandablebox?utm_source=ayiin&utm_medium=referral", page: "https://unsplash.com/photos/shallow-focus-photo-of-brown-cardboard-box-8mCsyImZRGY?utm_source=ayiin&utm_medium=referral", fp: [0.5, 0.66, 1] };
const p_yiU8G1K85AM: ProductPhoto = { id: "yiU8G1K85AM", src: "https://images.unsplash.com/photo-1577702312572-5bb9328a9f15?ixid=M3wxMDg3NzYwfDB8MXxzZWFyY2h8OHx8Y2FyZGJvYXJkJTIwc2hpcHBpbmclMjBib3hlc3xlbnwxfHx8fDE3OTA3MjIxNDZ8MA&ixlib=rb-4.1.0", color: "#262626", by: "Brandable Box", profile: "https://unsplash.com/@brandablebox?utm_source=ayiin&utm_medium=referral", page: "https://unsplash.com/photos/two-brown-boxes-and-dvd-cases-on-rack-yiU8G1K85AM?utm_source=ayiin&utm_medium=referral" };
const p_GopRYASfsOc: ProductPhoto = { id: "GopRYASfsOc", src: "https://images.unsplash.com/photo-1573376670774-4427757f7963?ixid=M3wxMDg3NzYwfDB8MXxzZWFyY2h8NXx8Y2FyZGJvYXJkJTIwc2hpcHBpbmclMjBib3hlc3xlbnwxfHx8fDE3OTA3MjIxNDZ8MA&ixlib=rb-4.1.0", color: "#d9d9d9", by: "Kelli McClintock", profile: "https://unsplash.com/@kelli_mcclintock?utm_source=ayiin&utm_medium=referral", page: "https://unsplash.com/photos/white-box-on-white-table-GopRYASfsOc?utm_source=ayiin&utm_medium=referral", fp: [0.36, 0.6, 1] };
const p_DcoB_NoNl6U: ProductPhoto = { id: "DcoB_NoNl6U", src: "https://images.unsplash.com/photo-1573376670329-0261ea9fde97?ixid=M3wxMDg3NzYwfDB8MXxzZWFyY2h8MTN8fGNhcmRib2FyZCUyMHNoaXBwaW5nJTIwYm94ZXN8ZW58MXx8fHwxNzkwNzIyMTQ2fDA&ixlib=rb-4.1.0", color: "#f3f3f3", by: "Kelli McClintock", profile: "https://unsplash.com/@kelli_mcclintock?utm_source=ayiin&utm_medium=referral", page: "https://unsplash.com/photos/brown-cardboard-box-DcoB_NoNl6U?utm_source=ayiin&utm_medium=referral" };
const p_eKZFEW0_nH4: ProductPhoto = { id: "eKZFEW0-nH4", src: "https://images.unsplash.com/photo-1573376671570-bc0e9aab13a1?ixid=M3wxMDg3NzYwfDB8MXxzZWFyY2h8MjZ8fGNhcmRib2FyZCUyMHNoaXBwaW5nJTIwYm94ZXN8ZW58MXx8fHwxNzkwNzIyMTQ2fDA&ixlib=rb-4.1.0", color: "#f3f3f3", by: "Kelli McClintock", profile: "https://unsplash.com/@kelli_mcclintock?utm_source=ayiin&utm_medium=referral", page: "https://unsplash.com/photos/closeup-photo-of-white-box-eKZFEW0-nH4?utm_source=ayiin&utm_medium=referral" };
const p_l6A1CggyaS4: ProductPhoto = { id: "l6A1CggyaS4", src: "https://images.unsplash.com/photo-1764764138818-0b22ab4d4023?ixid=M3wxMDg3NzYwfDB8MXxzZWFyY2h8MTR8fGtyYWZ0JTIwbWFpbGVyJTIwYm94JTIwcGFja2FnaW5nfGVufDF8fHx8MTc5MDcyMjE0OXww&ixlib=rb-4.1.0", color: "#8c5926", by: "Raymond Petrik", profile: "https://unsplash.com/@raymondpetrik?utm_source=ayiin&utm_medium=referral", page: "https://unsplash.com/photos/gift-box-wrapped-with-twine-and-festive-greenery-l6A1CggyaS4?utm_source=ayiin&utm_medium=referral" };
const p_XL7X_L5pq0Y: ProductPhoto = { id: "XL7X-L5pq0Y", src: "https://images.unsplash.com/photo-1764764138546-cedd1745362b?ixid=M3wxMDg3NzYwfDB8MXxzZWFyY2h8N3x8a3JhZnQlMjBtYWlsZXIlMjBib3glMjBwYWNrYWdpbmd8ZW58MXx8fHwxNzkwNzIyMTQ5fDA&ixlib=rb-4.1.0", color: "#c0c0c0", by: "Raymond Petrik", profile: "https://unsplash.com/@raymondpetrik?utm_source=ayiin&utm_medium=referral", page: "https://unsplash.com/photos/gift-box-with-greenery-and-wax-seal-on-piano-keys-XL7X-L5pq0Y?utm_source=ayiin&utm_medium=referral", fp: [0.5, 0.36, 1] };
const p_So6FM_ojMJM: ProductPhoto = { id: "So6FM-ojMJM", src: "https://images.unsplash.com/photo-1764764138587-189f22804ec4?ixid=M3wxMDg3NzYwfDB8MXxzZWFyY2h8MjN8fGtyYWZ0JTIwbWFpbGVyJTIwYm94JTIwcGFja2FnaW5nfGVufDF8fHx8MTc5MDcyMjE0OXww&ixlib=rb-4.1.0", color: "#a68c73", by: "Raymond Petrik", profile: "https://unsplash.com/@raymondpetrik?utm_source=ayiin&utm_medium=referral", page: "https://unsplash.com/photos/brown-gift-box-tied-with-white-string-and-red-seal-So6FM-ojMJM?utm_source=ayiin&utm_medium=referral" };
const p_gjI05nnZgrQ: ProductPhoto = { id: "gjI05nnZgrQ", src: "https://images.unsplash.com/photo-1766425221306-4d44f4011d4a?ixid=M3wxMDg3NzYwfDB8MXxzZWFyY2h8MTB8fGtyYWZ0JTIwbWFpbGVyJTIwYm94JTIwcGFja2FnaW5nfGVufDF8fHx8MTc5MDcyMjE0OXww&ixlib=rb-4.1.0", color: "#c08c59", by: "Raymond Petrik", profile: "https://unsplash.com/@raymondpetrik?utm_source=ayiin&utm_medium=referral", page: "https://unsplash.com/photos/brown-gift-boxes-tied-with-red-and-white-string-gjI05nnZgrQ?utm_source=ayiin&utm_medium=referral" };
const p_R8gTkVAYaog: ProductPhoto = { id: "R8gTkVAYaog", src: "https://images.unsplash.com/photo-1585417238564-fcdf0b69535f?ixid=M3wxMDg3NzYwfDB8MXxzZWFyY2h8OXx8bml0cmlsZSUyMGdsb3Zlc3xlbnwxfHx8fDE3OTA3MjIxNTN8MA&ixlib=rb-4.1.0", color: "#d9d9d9", by: "Anton", profile: "https://unsplash.com/@uniqueton?utm_source=ayiin&utm_medium=referral", page: "https://unsplash.com/photos/person-in-blue-gloves-with-white-background-R8gTkVAYaog?utm_source=ayiin&utm_medium=referral", fp: [0.05, 0.5, 1] };
const p_b2N7YVdZ7wU: ProductPhoto = { id: "b2N7YVdZ7wU", src: "https://images.unsplash.com/photo-1585417238563-fb9e08ae50af?ixid=M3wxMDg3NzYwfDB8MXxzZWFyY2h8NXx8bml0cmlsZSUyMGdsb3Zlc3xlbnwxfHx8fDE3OTA3MjIxNTN8MA&ixlib=rb-4.1.0", color: "#c0c0c0", by: "Anton", profile: "https://unsplash.com/@uniqueton?utm_source=ayiin&utm_medium=referral", page: "https://unsplash.com/photos/persons-hand-with-blue-light-b2N7YVdZ7wU?utm_source=ayiin&utm_medium=referral" };
const p_J9qHJEXD_Ss: ProductPhoto = { id: "J9qHJEXD_Ss", src: "https://images.unsplash.com/photo-1585421515039-18c1dc3d9c8b?ixid=M3wxMDg3NzYwfDB8MXxzZWFyY2h8MjZ8fG5pdHJpbGUlMjBnbG92ZXN8ZW58MXx8fHwxNzkwNzIyMTUzfDA&ixlib=rb-4.1.0", color: "#c0c0c0", by: "Anton", profile: "https://unsplash.com/@uniqueton?utm_source=ayiin&utm_medium=referral", page: "https://unsplash.com/photos/person-holding-blue-plastic-bag-J9qHJEXD_Ss?utm_source=ayiin&utm_medium=referral" };
const p_yqAl35Aafvk: ProductPhoto = { id: "yqAl35Aafvk", src: "https://images.unsplash.com/photo-1585421514234-f3e1081d11ee?ixid=M3wxMDg3NzYwfDB8MXxzZWFyY2h8MjV8fG5pdHJpbGUlMjBnbG92ZXN8ZW58MXx8fHwxNzkwNzIyMTUzfDA&ixlib=rb-4.1.0", color: "#a6a6a6", by: "Anton", profile: "https://unsplash.com/@uniqueton?utm_source=ayiin&utm_medium=referral", page: "https://unsplash.com/photos/person-in-blue-long-sleeve-shirt-yqAl35Aafvk?utm_source=ayiin&utm_medium=referral" };
const p_xeT67u7xuSo: ProductPhoto = { id: "xeT67u7xuSo", src: "https://images.unsplash.com/photo-1777269389417-511ee71ace2d?ixid=M3wxMDg3NzYwfDB8MXxzZWFyY2h8Mjd8fG5pdHJpbGUlMjBnbG92ZXN8ZW58MXx8fHwxNzkwNzIyMTUzfDA&ixlib=rb-4.1.0", color: "#d9d9d9", by: "Sergej *****", profile: "https://unsplash.com/@skstrannik?utm_source=ayiin&utm_medium=referral", page: "https://unsplash.com/photos/a-hand-wearing-a-black-nitrile-glove-xeT67u7xuSo?utm_source=ayiin&utm_medium=referral" };
const p_9OB46apMbC4: ProductPhoto = { id: "9OB46apMbC4", src: "https://images.unsplash.com/photo-1567954970774-58d6aa6c50dc?ixid=M3wxMDg3NzYwfDB8MXxzZWFyY2h8MXx8c2FmZXR5JTIwaGVsbWV0JTIwaGFyZCUyMGhhdHxlbnwxfHx8fDE3OTA3MjIxNTZ8MA&ixlib=rb-4.1.0", color: "#d9d9d9", by: "\u00dcmit Y\u0131ld\u0131r\u0131m", profile: "https://unsplash.com/@umityildirim?utm_source=ayiin&utm_medium=referral", page: "https://unsplash.com/photos/red-hard-hat-on-pavement-9OB46apMbC4?utm_source=ayiin&utm_medium=referral", fp: [0.74, 0.55, 1] };
const p_uooMllXe6gE: ProductPhoto = { id: "uooMllXe6gE", src: "https://images.unsplash.com/photo-1528740561666-dc2479dc08ab?ixid=M3wxMDg3NzYwfDB8MXxzZWFyY2h8M3x8Y2xlYW5pbmclMjBzcHJheSUyMGJvdHRsZXxlbnwxfHx8fDE3OTA3MjIxNTl8MA&ixlib=rb-4.1.0", color: "#595959", by: "Daiga Ellaby", profile: "https://unsplash.com/@daiga_ellaby?utm_source=ayiin&utm_medium=referral", page: "https://unsplash.com/photos/two-brown-spray-bottles-on-brown-table-uooMllXe6gE?utm_source=ayiin&utm_medium=referral" };
const p_pnMwt1zeJjQ: ProductPhoto = { id: "pnMwt1zeJjQ", src: "https://images.unsplash.com/photo-1707143598173-944230c2de24?ixid=M3wxMDg3NzYwfDB8MXxzZWFyY2h8MTJ8fGNsZWFuaW5nJTIwc3ByYXklMjBib3R0bGV8ZW58MXx8fHwxNzkwNzIyMTU5fDA&ixlib=rb-4.1.0", color: "#262626", by: "Andrea Lacasse", profile: "https://unsplash.com/@andrealacasse?utm_source=ayiin&utm_medium=referral", page: "https://unsplash.com/photos/a-couple-of-bottles-sitting-on-top-of-a-wooden-table-pnMwt1zeJjQ?utm_source=ayiin&utm_medium=referral" };

export const PRODUCT_PHOTOS: Record<string, Record<string, Partial<Record<ImageView, ProductPhoto>>>> = {
  "aurel-anc-over-ear": {
    "graphite": { hero: p_YDZPdqv3FcA },
  },
  "aurel-buds-pro": {
    "ink": { hero: p_JRK8tsVv3y0 },
  },
  "halo-speaker-mini": {
    "chalk": { hero: p_gbG65gRAGx4 },
  },
  "kova-book-14-air": {
    "silver": { hero: p_ZWfOEaNfelY, scene: p_s7IIk_2dA7g },
  },
  "kova-keys-low-profile": {
    "graphite": { hero: p_cVUPic1cbd4 },
  },
  "kova-vista-27-4k": {
    "graphite": { hero: p_gVpXbCGG6jI },
  },
  "kova-one": {
    "ink": { hero: p_uReyg5eZSbQ },
  },
  "arc-table-lamp": {
    "travertine": { hero: p_ulh3_dLSXjI },
  },
  "loom-lounge-chair": {
    "oat": { hero: p_7mmmEkyk0aQ },
  },
  "stoneware-bud-vases": {
    "bone": { hero: p_r0u8YuXfaho, angle: p_Gm1JXx_PA1Q, detail: p_aFvxASlms2A },
    "stone": { hero: p__cfd9px_GV8, angle: p_tSkPbVkiCqY },
  },
  "ember-soy-candle": {
    "amber": { hero: p_CUoyo6Pz0pU },
  },
  "olive-tree-terracotta": {
    "terracotta": { hero: p_vnOVs44jsog },
    "stone": { hero: p_VnE7Bh6OMpA },
  },
  "pour-gooseneck-kettle": {
    "matte-black": { hero: p_RkCvkHgfiqc, detail: p_ABubc4ERUvU, scene: p_tVeVHHWCfHM },
  },
  "everyday-stoneware-mugs": {
    "bone": { hero: p_vu0lyZYeseY },
  },
  "guji-single-origin-1kg": {
    "whole": { hero: p_wizWrRZJXSg },
    "espresso": { hero: p_wizWrRZJXSg },
  },
  "stride-runner-2": {
    "ink": { hero: p_VeW_kL0isfs },
  },
  "transit-daypack-22": {
    "ink": { hero: p_d_BTL93LsGg },
  },
  "meridian-automatic-38": {
    "rose": { hero: p_xfNeB1stZ_0 },
  },
  "solstice-sunglasses": {
    "tortoise": { hero: p_ODhxNCO8XHY },
    "crystal": { hero: p_dtOTQYmTEs0 },
  },
  "trail-bottle-750": {
    "chalk": { hero: p_Aej5gA11eHQ, scene: p_z7fI_BSHJRI },
  },
  "clarity-niacinamide-serum": {
    "30": { hero: p_WdJ4WnLxyDs },
    "60": { hero: p_WdJ4WnLxyDs },
  },
  "night-recovery-oil": {
    "30": { hero: p_b9KAwJRBXgw, angle: p_GDSNp1RJyLE, scene: p_2c1orP6z2eo },
  },
  "ergo-task-chair-pro": {
    "fog": { hero: p_7mfNpV5eJH0, angle: p_TIOGOV5ZQzA, detail: p_8hQu_VuLY08, scene: p_ElELSfycRvw },
  },
  "premium-copy-paper-a4": {
    "white": { hero: p_V29UWcALNko, detail: p_ou3l4V9DUNo },
  },
  "scanline-barcode-scanner": {
    "ink": { hero: p_1JSUX4iB0YE },
  },
  "double-wall-cartons-12x10x8": {
    "kraft": { hero: p_bYhDEWgqYLM, angle: p_8mCsyImZRGY, scene: p_yiU8G1K85AM },
    "white": { hero: p_GopRYASfsOc, angle: p_DcoB_NoNl6U, detail: p_eKZFEW0_nH4 },
  },
  "kraft-mailer-boxes": {
    "kraft": { hero: p_l6A1CggyaS4, angle: p_XL7X_L5pq0Y, detail: p_So6FM_ojMJM, scene: p_gjI05nnZgrQ },
  },
  "nitrile-gloves-4mil": {
    "blue": { hero: p_R8gTkVAYaog, angle: p_b2N7YVdZ7wU, detail: p_J9qHJEXD_Ss, scene: p_yqAl35Aafvk },
    "black": { hero: p_xeT67u7xuSo },
  },
  "vented-safety-helmet": {
    "red": { hero: p_9OB46apMbC4 },
  },
  "eco-surface-cleaner": {
    "citrus": { hero: p_uooMllXe6gE, scene: p_pnMwt1zeJjQ },
    "unscented": { hero: p_uooMllXe6gE, scene: p_pnMwt1zeJjQ },
  },
};
