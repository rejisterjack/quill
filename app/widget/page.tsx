export default function WidgetDocsPage() {
  return (
    <div className="max-w-3xl mx-auto py-10 space-y-4">
      <h1 className="text-3xl font-bold">Embed script</h1>
      <p className="text-sm text-default-500">
        Add this snippet to any page. It injects an iframe pointed at /embed with your API key.
      </p>
      <pre className="text-xs bg-default-100 p-4 rounded-xl overflow-auto">{`<script src="https://your-quill-host/widget.js" data-key="YOUR_KEY"></script>`}</pre>
    </div>
  );
}
