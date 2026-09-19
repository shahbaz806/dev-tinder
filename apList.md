# DevTinder Apis

# authRouter
-post /signuppot
-post /login
-post /logout

# profileRouter
-get /profile/view
-patch /profille/edit
-patch /profile/password forgot password api (hw)

# connectionRequestRouter
-post /request/send/interested/:userid
-post /request/send/ignored/:userid
-post /request/review/accdepted/:requestid
-post /request/review/rejected/:requestid

# userRouter
get /user/connections
get /requests/recived
get /feed - gets you the profiles of other user on platform


status: ignore, interested, accepted, rejected