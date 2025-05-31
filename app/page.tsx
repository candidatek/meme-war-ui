// import { getHomePageWarsDetails } from "@/app/api/getWarDetailsServer";
import { HomePage } from "@/components/meme-coin-wars"

export default async function Home() {
  // const warArray = await getHomePageWarsDetails("currently_live", "all", 10, 0);
  return (
    <HomePage />
  )
}

