import BattleRoomClient from "@/components/battle/BattleRoomClient";

export const metadata = {
  title: { absolute: "Battle Room | PrepZii" },
};

export default async function BattleRoomPage({ params }) {
  const { id } = await params;
  return <BattleRoomClient battleId={id} />;
}
