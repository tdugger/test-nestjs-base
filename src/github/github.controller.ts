import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import axios, {
  AxiosPromise,
  AxiosRequestConfig,
  AxiosRequestHeaders,
} from 'axios';

type Issue = {
  title: string;
  id: number;
  body: string | null;
};

const getGithubHeaders = (): AxiosRequestHeaders => {
  const githubHeaders: AxiosRequestHeaders = {
    accept: 'application/vnd.github+json',
    authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
  };
  return githubHeaders;
};

const stringContainImgTag = (issueBody: string): boolean => {
  let hasImage = false;
  if (issueBody?.includes('<img')) {
    hasImage = true;
  }
  return hasImage;
};

const getGithubIssue = async (url: string): Promise<Issue> => {
  const options: AxiosRequestConfig = {
    method: 'GET',
    headers: getGithubHeaders(),
    url,
  };
  const response = await axios(options);
  return response.data as Issue;
};

const addGithubComment = (url: string, comment: string): AxiosPromise => {
  const options: AxiosRequestConfig = {
    method: 'POST',
    headers: getGithubHeaders(),
    data: { body: comment },
    url,
  };
  return axios(options);
};

@Controller()
export class GithubController {
  @Get('/api/v1/github/:owner/:repo/issue/:issue_number')
  public async getIssue(@Param() params) {
    const url = `${process.env.GITHUB_URL}/repos/${params.owner}/${params.repo}/issues/${params.issue_number}`;
    const issue = await getGithubIssue(url);
    return { id: issue.id, title: issue.title, body: issue.body };
  }

  @Get('/api/v1/github/:owner/:repo/issue/:issue_number/image')
  public async doesIssueHaveImage(@Param() params) {
    const url = `${process.env.GITHUB_URL}/repos/${params.owner}/${params.repo}/issues/${params.issue_number}`;
    const issue = await getGithubIssue(url);
    const hasImage = stringContainImgTag(issue.body);
    return { containsImage: hasImage };
  }

  @Post('/api/v1/github/:owner/:repo/issue/:issue_number/comment')
  public async postComment(@Param() params, @Body() comment) {
    const url = `${process.env.GITHUB_URL}/repos/${params.owner}/${params.repo}/issues/${params.issue_number}/comments`;
    const response = await addGithubComment(url, comment.body);
    const success = response.status < 400 ? true : false;
    return { success };
  }

  @Post('/api/v1/github/:owner/:repo/issue/:issue_number/identify')
  public async postCommentIfImage(@Param() params, @Body() comment) {
    const url = `${process.env.GITHUB_URL}/repos/${params.owner}/${params.repo}/issues/${params.issue_number}`;
    const issue = await getGithubIssue(url);
    let success = false;
    if (stringContainImgTag(issue.body)) {
      const commentUrl = `${process.env.GITHUB_URL}/repos/${params.owner}/${params.repo}/issues/${params.issue_number}/comments`;
      const date = new Date();
      const newComment = `${comment.body} ${date.toString()}`;
      const response = await addGithubComment(commentUrl, newComment);
      success = response.status < 400 ? true : false;
      return { success };
    } else {
      return { success };
    }
  }
}
