import type { GameMechanic } from '$lib/types/domain/game-mechanics';
import type {
	ContentAuditFields,
	ContentReference,
	ContentSource,
	ContentType,
	ContentVisibility
} from './content';

export interface ContentItemBase extends ContentAuditFields, ContentReference {
	contentType: ContentType;
	ownerUserId: string | null;
	source: ContentSource;
	visibility: ContentVisibility;
	summary: string | null;
	description: string | null;
	mechanics: GameMechanic[];
	isSystemContent: boolean;
}
