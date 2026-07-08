import { redirect } from "next/navigation";

export default async function AdminPanelPage() {
  redirect("/panel?view=payroll");
}
