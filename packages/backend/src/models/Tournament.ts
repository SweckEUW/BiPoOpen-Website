import mongoose, { Document, Schema } from 'mongoose';

export interface ITournamentModel extends Document {}

const TournamentSchema = new Schema(
    {
        name: { type: String, required: true },
        groupPhase: {
            type: {
                groups: {
                    type: [
                        {
                            teams: [
                                {
                                    teamID: { type: Schema.Types.ObjectId, ref: 'Team' },
                                    _id: false
                                }
                            ]
                        }
                    ]
                },
                matches: {
                    type: [
                        [
                            {
                                team1ID: { type: Schema.Types.ObjectId, ref: 'Team' },
                                team2ID: { type: Schema.Types.ObjectId, ref: 'Team' },
                                result: {
                                    team1Score: { type: Number, required: true },
                                    team2Score: { type: Number, required: true },
                                    team1Player1Score: { type: Number, required: false },
                                    team1Player2Score: { type: Number, required: false },
                                    team2Player1Score: { type: Number, required: false },
                                    team2Player2Score: { type: Number, required: false }
                                },
                                _id: false
                            }
                        ]
                    ]
                }
            },
            required: true
        },
        knockoutPhase: {
            type: {
                matches: [
                    [
                        {
                            team1ID: { type: Schema.Types.ObjectId, ref: 'Team' },
                            team2ID: { type: Schema.Types.ObjectId, ref: 'Team' },
                            result: {
                                team1Score: { type: Number, required: true },
                                team2Score: { type: Number, required: true },
                                team1Player1Score: { type: Number, required: false },
                                team1Player2Score: { type: Number, required: false },
                                team2Player1Score: { type: Number, required: false },
                                team2Player2Score: { type: Number, required: false }
                            },
                            _id: false
                        }
                    ]
                ]
            },
            required: true
        },
        teams: [
            {
                name: { type: String, required: true },
                players: { type: [String], required: true }
            }
        ],
        settings: {
            type: {
                trackPlayerShots: { type: Boolean, required: true },
                trackTeamShots: { type: Boolean, required: true },
                fixedGroupAmmount: { type: Number, required: true, default: 4 },
                advancingTeamsPerGroup: { type: Number, required: true, default: 2 },
            },
            required: true
        }
    }, 
    {
        versionKey: false
    }
);

export default mongoose.model<ITournamentModel>('Tournament', TournamentSchema, "tournaments");