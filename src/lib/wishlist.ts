import { supabase } from "@/integrations/supabase/supabaseClient";

export async function getWishlist(userEmail: string) {
  const { data, error } = await supabase
    .from("wishlist")
    .select("product_id")
    .eq("user_email", userEmail);
  if (error) throw error;
  return data?.map((row) => row.product_id) || [];
}

export async function addToWishlist(userEmail: string, productId: string) {
  const { error } = await supabase
    .from("wishlist")
    .insert([{ user_email: userEmail, product_id: productId }]);
  if (error) throw error;
}

export async function removeFromWishlist(userEmail: string, productId: string) {
  const { error } = await supabase
    .from("wishlist")
    .delete()
    .eq("user_email", userEmail)
    .eq("product_id", productId);
  if (error) throw error;
}
