import Link from 'next/link';
import Image from 'next/image';
import { ArrowRightIcon } from '@/assets/icons';
import { Blog } from '@/types/blogItem';

const BlogItem = ({ blog }: { blog: Blog }) => {
  return (
    <div className="shadow-1 bg-white rounded-xl px-4 sm:px-5 pt-5 pb-4">
      <Link
        href={`/blog/${blog?.slug}`}
        className="rounded-md overflow-hidden"
      >
        <Image
          src={
            blog.mainImage ? blog?.mainImage : '/no image'
          }
          alt="blog"
          className="rounded-md w-full h-[210px] object-cover"
          width={330}
          height={210}
        />
      </Link>

      <div className="mt-5.5">
        <span className="flex items-center gap-3 mb-2.5">
          <Link
            href="#"
            className="text-custom-sm ease-out duration-200 hover:text-blue"
          >
            {blog.createdAt &&
              new Date(blog.createdAt)
                .toDateString()
                .split(' ')
                .slice(1)
                .join(' ')}
          </Link>

          {/* <!-- divider --> */}
          {/* <span className="block w-px h-4 bg-gray-4"></span>

          <Link
            href="#"
            className="text-custom-sm ease-out duration-200 hover:text-blue"
          >
            100k Views
          </Link> */}
        </span>

        <h2 className="font-medium text-dark text-lg sm:text-xl ease-out duration-200 mb-4 hover:text-blue">
          <Link href={`/blog/${blog?.slug}`}>{blog.title}</Link>
        </h2>

        <Link
          href={`/blog/${blog?.slug}`}
          className="text-custom-sm inline-flex items-center gap-2 py-2 ease-out duration-200 hover:text-blue"
        >
          Read More
          <ArrowRightIcon />
        </Link>
      </div>
    </div>
  );
};

export default BlogItem;
