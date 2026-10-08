import ReviewForm from "../_components/ReviewForm";

async function ReviewAddPage() {
  return (
    <div className="w-full p-6 bg-white rounded-xl shadow-1">
      <h1 className="font-semibold text-xl  text-dark mb-2.5">Add Review</h1>
      <ReviewForm />
    </div>
  );
}

export default ReviewAddPage;
