interface TeamDetailPageProps {
  params: { id: string }
}

export default function TeamDetailPage({ params }: TeamDetailPageProps) {
  return <div>Individual team details for {params.id}</div>
}