"use client";
import React from "react";
import {
  FacebookIcon,
  TwitterIcon,
  LinkedinIcon,
  FacebookShareButton,
  TwitterShareButton,
  LinkedinShareButton,
} from "next-share";

const SocialShare = ({ slug }: { slug: string }) => {
  return (
    <div className="flex gap-3">
      <FacebookShareButton
        url={`${process.env.SITE_URL}/blog/${slug}`}
      >
        <FacebookIcon size={35} round={true} />
      </FacebookShareButton>

      <TwitterShareButton
        url={`${process.env.SITE_URL}/blog/${slug}`}
      >
        <TwitterIcon size={35} round={true} />
      </TwitterShareButton>

      <LinkedinShareButton
        url={`${process.env.SITE_URL}/blog/${slug}`}
      >
        <LinkedinIcon size={35} round={true} />
      </LinkedinShareButton>
    </div>
  );
};

export default SocialShare;
