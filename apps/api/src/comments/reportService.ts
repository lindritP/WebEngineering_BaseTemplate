import type { Comment } from './comment.js';
import type { CommentRepository, ReportState } from './commentRepository.js';
import type { TransactionRunner } from '../transactions.js';

// From this many reports on, a comment is hidden.
export const HIDE_AFTER_REPORTS = 3;
const ONE_REPORT = 1;

// The business rule, as a plain function: one more report, and the comment is
// hidden once it reaches the threshold (and stays hidden at its original time).
function nextReportState(current: Comment, now: Date): ReportState {
  const reportCount = current.reportCount + ONE_REPORT;
  const hiddenAt =
    reportCount >= HIDE_AFTER_REPORTS
      ? (current.hiddenAt ?? now.toISOString())
      : current.hiddenAt;
  return { reportCount, hiddenAt };
}

export class ReportService {
  constructor(
    private readonly comments: CommentRepository,
    private readonly transactions: TransactionRunner
  ) {}

  // The correct version. The whole "read, increment, write" is one transaction
  // and the read locks the row (SELECT ... FOR UPDATE): a second report for the
  // same comment waits at its own read until this transaction has committed,
  // and then sees the new count. Reports for OTHER comments do not wait.
  //
  // The transaction boundary is here, in the service: only the service knows
  // that these two repository calls form one business step.
  async report(commentId: string): Promise<Comment | undefined> {
    return await this.transactions.run(async ({ comments }) => {
      const current = await comments.findByIdForUpdate(commentId);
      if (current === undefined) {
        return undefined;
      }
      return await comments.saveReportState(
        commentId,
        nextReportState(current, new Date())
      );
    });
  }

  // The NAIVE version, kept only to demonstrate the lost update (see
  // npm run demo:lost-update and the tests). Never call it from a route.
  //
  // Read, increment in TypeScript, write back: two requests that both read
  // count = 7 both write 8, and one report is lost. Nothing stops the second
  // read from happening between the first read and the first write.
  async reportNaively(commentId: string): Promise<Comment | undefined> {
    const current = await this.comments.findById(commentId);
    if (current === undefined) {
      return undefined;
    }
    return await this.comments.saveReportState(
      commentId,
      nextReportState(current, new Date())
    );
  }
}
