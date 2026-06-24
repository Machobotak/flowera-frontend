import { redirect } from "next/navigation";

// Redirect old /store/products/create to new shared form route
export default function CreateProductRedirect() {
  redirect("/store/products/new");
}
