import { File } from 'gitdiff-parser';
import OpenAI from 'openai';
import * as z from 'zod';

import { PullRequestComment } from '~/repositories/bitbucket-repository';
import { zodTextFormat } from 'openai/helpers/zod';

export type CodeReviewInstruction = {
  commentLanguage: string;
  instruction: string;
};

const Comment = z.object({
  commentLine: z.number().nonnegative(),
  filepath: z.string(),
  comment: z.string(),
});

const Comments = z.object({
  comments: z.array(Comment),
});

export class ReviewerAgentService {
  async review(codeReviewInstruction: CodeReviewInstruction, diffs: File[], currentComments: PullRequestComment[]) {
    const client = new OpenAI();

    const response = await client.responses.parse({
      model: 'o4-mini',
      input: [
        {
          role: 'system',
          content:
            'You are a code reviewer.\n' +
            'Your role is to help developers improve their code.\n' +
            'You will receive an annotated diff with the code changes to be reviewed, and you should respond with feedback on the code.\n' +
            'Comment only on what needs improvement.\n' +
            'Comment only at included lines, not deleted ones.\n' +
            'Make sure to do not include any comment similar to what has already been made.\n' +
            'The comment text must be formated in markdown\n' +
            'Always use an empathetic and educational writing style.\n' +
            `Respond to the user in ${codeReviewInstruction.commentLanguage} language.\n\n\n` +
            'Bellow is the code project guidelines:\n' +
            codeReviewInstruction.instruction,
        },
        {
          role: 'user',
          content:
            'Here is the current comments on the pull request:\n\n' +
            JSON.stringify(currentComments, null, 2) +
            '\n\n' +
            'Now, here is the diff:\n\n' +
            JSON.stringify(diffs, null, 2),
        },
      ],
      text: {
        format: zodTextFormat(Comments, 'comments'),
      },
    });

    return response.output_parsed;
  }
}
