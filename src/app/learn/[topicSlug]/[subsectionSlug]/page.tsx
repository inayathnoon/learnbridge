type Props = {
  params: { topicSlug: string; subsectionSlug: string };
};

export default function LearnPage({ params }: Props) {
  return (
    <main>
      <h1>
        {params.topicSlug} / {params.subsectionSlug}
      </h1>
      {/* Walkthrough + quiz — implemented in learn feature task */}
    </main>
  );
}
