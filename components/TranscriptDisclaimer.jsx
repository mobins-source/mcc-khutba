export default function TranscriptDisclaimer() {
  return (
    <div className="bg-warm border border-border rounded-lg px-4 py-3 mb-8">
      <p className="text-xs text-dim leading-relaxed italic">
        <span className="text-amber-dark font-medium not-italic">Note:</span>{' '}
        This transcript was generated using YouTube's automatic captioning, with
        AI-assisted cleanup for readability. It may contain inaccuracies due to
        background noise, audio quality, or limitations of the transcription
        software — particularly during Arabic recitation. Listener discretion
        is advised; please refer to the original video for precise wording.
      </p>
    </div>
  )
}
