import Link from "next/link";
import { getPostTags } from "@/get-api-data/blog";

const Tags = async () => {
  const tags = await getPostTags();

  const uniqueTagsSet = new Set(tags.flatMap((post) => post?.tags || []));
  const uniqueTagsArray = [...uniqueTagsSet]; // Convert Set to Array

  return (
    <div className="bg-white shadow-1 rounded-xl">
      <div className="px-4 sm:px-6 py-4.5 border-b border-gray-3">
        <h2 className="text-lg font-medium text-dark">Tags</h2>
      </div>

      <div className="p-4 sm:p-6">
        <div className="flex flex-wrap gap-3.5">
          {uniqueTagsArray &&
            uniqueTagsArray.map((tag, i) => (
              <Link
                key={i}
                className="inline-flex px-4 py-2 capitalize duration-200 ease-out border rounded-md hover:text-white border-gray-3 hover:bg-blue hover:border-blue"
                href={`/blog/tags/${tag}`}
              >
                {tag}
              </Link>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Tags;
