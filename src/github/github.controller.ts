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

const getGithubHeaders = () => {
  const githubHeaders: AxiosRequestHeaders = {
    accept: 'application/vnd.github+json',
    authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
  };
  return githubHeaders;
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
}
