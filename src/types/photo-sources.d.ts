declare module 'virtual:photo-sources' {
  const photos: {
    id: number;
    width: number;
    height: number;
    fallback: string;
    thumbnail: string;
    variants: { file: string; format: string; width: number }[];
  }[];
  export default photos;
}
