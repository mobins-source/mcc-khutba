import FeedbackForm from '../../components/FeedbackForm'

export const metadata = {
  title:       'Feedback — MCC Tucson Lectures',
  description: 'Share feedback, report an issue, or suggest something for the MCC Tucson lecture archive.',
}

export default function FeedbackPage() {
  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-8">
        <div className="text-xs font-medium text-amber uppercase tracking-widest mb-2">
          We&rsquo;d like to hear from you
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-semibold text-ink mb-2 leading-tight">
          Feedback
        </h1>
        <p className="text-dim text-base leading-relaxed">
          Found a broken link, want a lecture series added to the Study Guide,
          or just have a thought on how this site could be more useful?
          Let us know below.
        </p>
      </div>

      <FeedbackForm />
    </div>
  )
}
