import { MongoClient, ObjectId } from "mongodb";

const uri = process.env.MONGODB_URI ?? "mongodb://localhost:27017/crushsaver";

let client: MongoClient | null = null;

async function getCollection() {
  if (!client) {
    client = new MongoClient(uri);
    await client.connect();
  }
  return client.db().collection("suggestions");
}

export interface Suggestion {
  id: string;
  user_id: string;
  facebook_url: string;
  facebook_id: string | null;
  name: string;
  profile_picture: string | null;
  rating: number | null;
  tags: string | null; // JSON-encoded string[]
  notes: string | null;
  created_at: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toSuggestion(doc: any): Suggestion {
  const { _id, ...rest } = doc;
  return { id: (_id as ObjectId).toString(), ...rest };
}

export async function getAllSuggestions(userId: string): Promise<Suggestion[]> {
  const col = await getCollection();
  const docs = await col.find({ user_id: userId }).sort({ position: 1, created_at: -1 }).toArray();
  return docs.map(toSuggestion);
}

export async function addSuggestion(data: {
  user_id: string;
  facebook_url: string;
  facebook_id?: string | null;
  name: string;
  profile_picture?: string | null;
}): Promise<Suggestion> {
  const col = await getCollection();
  const last = await col.findOne({ user_id: data.user_id }, { sort: { position: -1 } });
  const position = last && typeof last.position === "number" ? last.position + 1 : 0;
  const doc = {
    user_id: data.user_id,
    facebook_url: data.facebook_url,
    facebook_id: data.facebook_id ?? null,
    name: data.name,
    profile_picture: data.profile_picture ?? null,
    rating: null as number | null,
    tags: null as string | null,
    position,
    created_at: new Date().toISOString(),
  };
  const result = await col.insertOne(doc);
  return { id: result.insertedId.toString(), ...doc };
}

export async function reorderSuggestions(userId: string, orderedIds: string[]): Promise<void> {
  const col = await getCollection();
  await Promise.all(
    orderedIds.map((id, index) =>
      col.updateOne(
        { _id: new ObjectId(id), user_id: userId },
        { $set: { position: index } }
      )
    )
  );
}

export async function updateSuggestion(
  id: string,
  userId: string,
  data: {
    facebook_url: string;
    name: string;
    profile_picture: string | null;
    rating: number | null;
    tags: string | null;
    notes: string | null;
  }
): Promise<void> {
  const col = await getCollection();
  await col.updateOne(
    { _id: new ObjectId(id), user_id: userId },
    { $set: data }
  );
}

export async function deleteSuggestion(id: string, userId: string): Promise<void> {
  const col = await getCollection();
  await col.deleteOne({ _id: new ObjectId(id), user_id: userId });
}
