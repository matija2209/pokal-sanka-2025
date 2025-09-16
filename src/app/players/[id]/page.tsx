interface PlayerDetailPageProps {
  params: { id: string }
}

export default function PlayerDetailPage({ params }: PlayerDetailPageProps) {
  return <div>Individual player details for {params.id}</div>
}