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

@Controller()
export class GithubController {
  @Get('/api/v1/github/:owner/:repo/issue/:issue_number')
  public async getIssue(@Param() params) {
    const url = `${process.env.GITHUB_URL}/repos/${params.owner}/${params.repo}/issues/${params.issue_number}`;
    const options: AxiosRequestConfig = {
      method: 'GET',
      headers: getGithubHeaders(),
      url,
    };
    const response = await axios(options);
    const issue: Issue = response.data as Issue;
    return { id: issue.id, title: issue.title, body: issue.body };
  }

  @Get('/api/v1/github/:owner/:repo/issue/:issue_number/image')
  public async doesIssueHaveImage(@Param() params) {
    const url = `${process.env.GITHUB_URL}/repos/${params.owner}/${params.repo}/issues/${params.issue_number}`;
    const options: AxiosRequestConfig = {
      method: 'GET',
      headers: getGithubHeaders(),
      url,
    };
    const response = await axios(options);
    const issue: Issue = response.data as Issue;
    const hasImage = stringContainImgTag(issue.body);
    return { containsImage: hasImage };
  }
}
