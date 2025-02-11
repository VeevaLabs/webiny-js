import { Response, ErrorResponse } from "@webiny/handler-graphql/responses";
import { CmsEntryResolverFactory as ResolverFactory } from "~/types";

type ResolveRequestChanges = ResolverFactory<any, { revision: string }>;

export const resolveRequestChanges: ResolveRequestChanges =
    ({ model }) =>
    async (_, args, { cms }) => {
        try {
            const entry = await cms.requestEntryChanges(model, args.revision);

            return new Response(entry);
        } catch (e) {
            return new ErrorResponse(e);
        }
    };
