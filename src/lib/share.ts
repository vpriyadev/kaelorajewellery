export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  discountPrice: number;
  description?: string;
  // other fields as needed
}

export const handleShare = async (product: Product) => {
  if (typeof window === 'undefined') return;
  const shareData = {
    title: product.name,
    text: `${product.name} - ₹${product.discountPrice}`,
    url: `${window.location.origin}/product/${product.slug}`,
  } as any;

  if (navigator.share) {
    try {
      await navigator.share(shareData);
    } catch (err) {
      // Fallback to clipboard if share fails
      await navigator.clipboard.writeText(shareData.url);
      alert('Product link copied!');
    }
  } else {
    await navigator.clipboard.writeText(shareData.url);
    alert('Product link copied!');
  }
};
