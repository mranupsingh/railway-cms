import { ROUTE } from "@/lib/routes";
import { redirect } from "next/navigation";

export default function Home() {

  redirect(ROUTE.LOGIN)

  return (<></>);
}
