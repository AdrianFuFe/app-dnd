import type { GameMechanic } from '$lib/types/domain/game-mechanics';
import type {
	ContentMode,
	ContentAuditFields,
	EditorialStatus,
	ContentReference,
	RulesetCode,
	ContentSource,
	ContentType,
	ContentVisibility
} from './content';

export interface ContentItemBase extends ContentAuditFields, ContentReference {
	contentType: ContentType;
	ownerUserId: string | null;
	source: ContentSource;
	rulesetCode: RulesetCode;
	contentMode: ContentMode;
	editorialStatus: EditorialStatus;
	visibility: ContentVisibility;
	summary: string | null;
	description: string | null;
	mechanics: GameMechanic[];
	isSystemContent: boolean;
}
