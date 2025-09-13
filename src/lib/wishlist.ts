import { apiService } from "@/lib/apiService";

export async function getWishlist(userEmail: string) {
  const result = await apiService.getWishlistItems(userEmail);
  if (result.error) throw result.error;
  return result.data?.map((row) => row.product_id) || [];
}

export async function addToWishlist(userEmail: string, productId: string) {
  const result = await apiService.addToWishlist(userEmail, { product_id: productId });
  if (result.error) throw result.error;
}

export async function removeFromWishlist(userEmail: string, productId: string) {
  const result = await apiService.removeFromWishlist(userEmail, productId);
  if (result.error) throw result.error;
}
