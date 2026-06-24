export interface JsonObject {
	[key: string]: JsonValue | undefined;
}

export type JsonArray = JsonValue[];

export type JsonPrimitive = string | number | boolean | null;

export type JsonValue = JsonPrimitive | JsonObject | JsonArray;

export interface Database {
	public: {
		Tables: {
			profiles: {
				Row: {
					id: string;
					display_name: string | null;
					global_role: import('$lib/types/permissions/permissions').GlobalRole;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id: string;
					display_name?: string | null;
					global_role?: import('$lib/types/permissions/permissions').GlobalRole;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					display_name?: string | null;
					global_role?: import('$lib/types/permissions/permissions').GlobalRole;
					created_at?: string;
					updated_at?: string;
				};
				Relationships: [];
			};
		};
		Views: Record<string, never>;
		Functions: Record<string, never>;
		Enums: Record<string, never>;
		CompositeTypes: Record<string, never>;
	};
}
