import mongoose from "mongoose";

export const tournamentAggregation = () => [
    // Gruppenteams mit Team-Details ersetzen
    {
      $addFields: {
        "groupPhase.groups": {
          $map: {
            input: "$groupPhase.groups",
            as: "group",
            in: {
              teams: {
                $map: {
                  input: "$$group.teams",
                  as: "teamEntry",
                  in: {
                    $arrayElemAt: [
                      {
                        $filter: {
                          input: "$teams",
                          as: "team",
                          cond: { $eq: ["$$team._id", "$$teamEntry.teamID"] }
                        }
                      },
                      0
                    ]
                  }
                }
              }
            }
          }
        }
      }
    },
  
    // Spiele in der Gruppenphase mit Team-Details ersetzen
    {
      $addFields: {
        "groupPhase.matches": {
          $map: {
            input: "$groupPhase.matches",
            as: "matchList",
            in: {
              $map: {
                input: "$$matchList",
                as: "match",
                in: {
                  team1: {
                    $arrayElemAt: [
                      {
                        $filter: {
                          input: "$teams",
                          as: "team",
                          cond: { $eq: ["$$team._id", "$$match.team1ID"] }
                        }
                      },
                      0
                    ]
                  },
                  team2: {
                    $arrayElemAt: [
                      {
                        $filter: {
                          input: "$teams",
                          as: "team",
                          cond: { $eq: ["$$team._id", "$$match.team2ID"] }
                        }
                      },
                      0
                    ]
                  },
                  result: "$$match.result"
                }
              }
            }
          }
        }
      }
    },
  
    // Spiele in der K.O.-Phase mit Team-Details ersetzen
    {
      $addFields: {
        "koPhase.matches": {
          $map: {
            input: "$koPhase.matches",
            as: "matchList",
            in: {
              $map: {
                input: "$$matchList",
                as: "match",
                in: {
                  team1: {
                    $arrayElemAt: [
                      {
                        $filter: {
                          input: "$teams",
                          as: "team",
                          cond: { $eq: ["$$team._id", "$$match.team1ID"] }
                        }
                      },
                      0
                    ]
                  },
                  team2: {
                    $arrayElemAt: [
                      {
                        $filter: {
                          input: "$teams",
                          as: "team",
                          cond: { $eq: ["$$team._id", "$$match.team2ID"] }
                        }
                      },
                      0
                    ]
                  },
                  result: "$$match.result"
                }
              }
            }
          }
        }
      }
    },
  
    // Unnötige teamID-Felder entfernen
    {
      $project: {
        "groupPhase.groups.teams.teamID": 0,
        "groupPhase.matches.team1ID": 0,
        "groupPhase.matches.team2ID": 0,
        "koPhase.matches.team1ID": 0,
        "koPhase.matches.team2ID": 0
      }
    }
  ];

  